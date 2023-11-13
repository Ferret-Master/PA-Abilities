


/*
takes in the model name and returns the full path.
*/

var world = api.getWorldView(0);

model.unitKeys = _.keys(model.unitSpecs);


model.executeAsPlayer = function(playerIndex, command, commandVars, timeout){
    if(timeout == undefined){var timeout = 50}
    var switchPlayer = false;
    if(playerIndex !== "" && playerIndex !== undefined && playerIndex !== model.armyIndex()){switchPlayer = true}

    if(switchPlayer == true){
                         
        api.Panel.message("devmode","switchControl",playerIndex);

        var tempFunc = function(commandVars){command(commandVars);}
        commandVars.unshift(null);
        setTimeout(tempFunc.bind(commandVars),timeout);
       		
            
        }
    else{
   
    command(commandVars);
    
    

    }



}

model.fullUnitName = function(unitName){

    if(model.unitKeys == []){ model.unitKeys = _.keys(model.unitSpecs);}
    unitName+=".json";
    var chosenUnit = "";
    
    for(var i = 0;i<model.unitKeys.length;i++){
        
        if(model.unitKeys[i].endsWith(unitName)){
            chosenUnit = model.unitKeys[i];
            
        }
    }
    if(!chosenUnit.length>1){return ""}
    return chosenUnit;

}
/*

if stateflag is true returns all of the unit states instead.

should probably add a unitflag to this in case I only want one unittypes states.

model.playerArmy(0,0,"",true).then(function(ready){console.log(ready)}) -test command

//adding unit types as an option would be good, e.g all fabs or all factorys
//unit type is things like Mobile, Construction, Etc


//TODO make planet optional and if not defined it checks every planet
*/
var unitJsons = model.unitSpecs//I think this has a list of unit keys that then have types

model.allPlayerArmy = function(playerId,unitType, stateFlag,unitTypeValue){
    var planets = model.planetListState()
    var promiseArray = [];
    for(planet in planets.planets){
        planet = planets.planets[planet]
        if(planet.id !== undefined || planet.id === 0){
            var chosenPlanet = planet.index;
        }
        else{continue}

        promiseArray.push(model.playerArmy(playerId, chosenPlanet,unitType, stateFlag,unitTypeValue))
    }
    var allPlanetArmyPromise = Promise.all(promiseArray)
    return allPlanetArmyPromise.then(function(result){
        var finalUnits = {};
        for(army in result){// for each player planet
            var armyKeys = _.keys(result[army])
           

            for(unit in armyKeys){//for each unit on a planet
              
                if(!(armyKeys[unit] in finalUnits)){finalUnits[armyKeys[unit]] = []};//if 
               
                
                for(i in result[army][armyKeys[unit]]){
                 
                    finalUnits[armyKeys[unit]].push(result[army][armyKeys[unit]][i])
                }
               
            
        }
    }
      
        return finalUnits;

    })

}
model.playerArmy = function(playerId, planetId,unitType, stateFlag,unitTypeValue){

    if(unitJsons == undefined){unitJsons = model.unitSpecs}
    var one = !_.isArray(unitType);
    if (one){
        unitType = [unitType];

    }
    var one = !_.isArray(unitTypeValue);
    if (one){
        unitTypeValue = [unitTypeValue];

    }

    var promise = new Promise(function(resolve,reject){

        if(world){

            if(stateFlag !== true){
                
            
                
                var promise2 = world.getArmyUnits(playerId,planetId).then(function (result){
                   
                   
                    if(unitType.length>0 && unitType[0] !== "" && unitType[0] !== undefined){
                 
                        var finalResult = {};
                        
                        for(var i = 0;i<unitType.length;i++){

                            finalResult[unitType[i]] = result[unitType[i]]

                        }
                       
                        result =  finalResult;
                    }
                
                    if(unitTypeValue.length>0 && unitTypeValue[0] !== "" && unitTypeValue[0] !== undefined){
                      
         
                        var finalResult = {};
                        var jsonKeys = _.keys(unitJsons)
                        for(var i = 0;i<jsonKeys.length;i++){
                            var matchedValue = 0;
                            for(var j = 0;j<unitTypeValue.length;j++){
                                
                                if(_.contains(unitJsons[jsonKeys[i]].types,unitTypeValue[j])){//check if each unit json contains every type in the value array
                                  
                                    //if(_.contains(unitJsons[jsonKeys[i]].types,"UNITTYPE_NoBuild")){continue}
                                    matchedValue++;
                             
                                }
                            }
                            
                           
                            if(matchedValue == unitTypeValue.length && result[jsonKeys[i]] !== undefined){finalResult[jsonKeys[i]] = result[jsonKeys[i]]}
                        }
                     
                        result = finalResult;

                    }
               

                    return result
                
                
                
                
                })
           
                resolve(promise2)
            
            
            
            }//TODO add unit filter here
    
            else{
         
                    var promise2 = world.getArmyUnits(playerId,planetId).then(function(result){ 
    
                    var unitArray = [];
                    
                    if(unitType.length>0 && unitType[0] !== "" && unitType[0] !== undefined){
                        
                        var finalResult = {};
                        
                        for(var i = 0;i<unitType.length;i++){

                            finalResult[unitType[i]] = result[unitType[i]]

                        }
                      
                        result =  finalResult;
                    }
                 
                    if(unitTypeValue.length>0 && unitTypeValue[0] !== "" && unitTypeValue[0] !== undefined){
         
                        var finalResult = {};
                        var jsonKeys = _.keys(unitJsons)
                        for(var i = 0;i<jsonKeys.length;i++){
                            var matchedValue = 0;
                            for(var j = 0;j<unitTypeValue.length;j++){
                                
                                if(_.contains(unitJsons[jsonKeys[i]].types,unitTypeValue[j])){//check if each unit json contains every type in the value array
                                    matchedValue++;
                             
                                }
                            }
                            if(matchedValue == unitTypeValue.length && result[jsonKeys[i]] !== undefined){finalResult[jsonKeys[i]] = result[jsonKeys[i]]}
                        }
                        result = finalResult;

                    }
                    
                    armyKeys = _.keys(result)
                    for(var i = 0;i<armyKeys.length;i++){
                        unitArray.push(result[armyKeys[i]])
                    }
                    unitArray = _.flatten(unitArray)
                   
                    return world.getUnitState(unitArray).then(function (ready) {
                        var unitData = this.result;
                        var one = !_.isArray(unitData);
                        if (one){
                                unitData = [unitData];
    
                        }
              
                        
                      return unitData;
                    }
                    
                   
                    )
                })
                
            }
          
            promise2.then(function(result){resolve(result)})
    
        }

    })

    promise.then(function(result){return result})
    
    return promise;
   


}

model.distanceBetween = function(point1,point2,R){
		
    //couldnt get great circle distance working/may have messed up taking it from previous code of mine so switching to straight line distance
    //it does mean area checks will not work well on small planets though. this would allow me to put the check point above the terrain to somewhat allievate it
    //var DistanceBetweenPoints = R*Math.acos((((point1[0])*(point2[0])+(point1[1])*(point2[1])+(point1[2])*(point2[2]))/(Math.pow(R,2))));
    var DistanceBetweenPoints = Math.pow((Math.pow((point2[0] - point1[0]),2) + Math.pow((point2[1] - point1[1]),2) + Math.pow((point2[2] - point1[2]),2)),0.5) 

    if(DistanceBetweenPoints == NaN ){console.log(point1 +" | "+ point2)}
    
    
    return DistanceBetweenPoints;
}

model.inRadius = function(point,center,R){
   
    if (model.distanceBetween(point,center,R) < R){
        
        return true;
    }
    else
        return false;
    
    
}
/*
returns either the number/id's of that unit type in the radius, or if type is not specified, total unit number/id's.
*/
model.countArmyInRadius = function(playerArmy,location,dataFlag){
    //console.log(JSON.stringify(playerArmy))
  


    var returnArray = [];

        returnValue = 0;
        
        for(var i = 0;i<playerArmy.length;i++){
            var unitPos = playerArmy[i].pos;
            if(this.inRadius(unitPos, location.pos, location.radius) == true){returnValue++;returnArray.push(playerArmy[i])}
        }
        
        
    
    if(dataFlag == true){return returnArray}

    else{return returnValue}
    
    


}
model.unitsInRadius = function(playerId,unitType, location, dataFlag){// this will be a rough function performance wise if reguarly checked so should be used sparingly.

    model.playerArmy(playerId,location[0].planet,unitType, true, model.countUnits)
   


    
}

model.randomLocations = function(amount,radius){ // returns array of random locations within 3d space of a certain radius
    
    var posArray = [];
    for(var points = 0; points<amount;points++){
                                    var pos1 = Math.floor(Math.random() * radius+1);
                                    var pos2 = Math.floor(Math.random() * radius+1);
                                    var pos3 = Math.floor(Math.random() * radius+1);
                                    
                                    posArray.push([pos1,pos2,pos3]);
                                    
                                    for(var count = 0; count<3;count++){
                                        var sign = Math.floor(Math.random() * 11);
                                        if (sign > 4){posArray[points][count] = posArray[points][count]*-1;}							
                                    }
    }
    
    return posArray;
}

//for non shared, mostly if the handler is not fired or ui is refreshed 
    
// gets commander data to update model when needed
model.getCommanderData = function(){
    var commanderId = model.scenarioModel.playerCommanderId
    var commanderData = api.getWorldView(0).getUnitState(commanderId)
    commanderData.then(function(result){
    
        for(i in result){
         
            if(result[i]["unit_spec"]){
                console.log(result[i]["unit_spec"])
                if(model.scenarioModel.playerSpawn.chosenPos == undefined){model.scenarioModel.playerSpawn.chosenPos = result[i].pos}
                if(model.scenarioModel.playerSpawn.chosenPlanet == undefined){model.scenarioModel.playerSpawn.chosenPlanet = result[i].planet}
                if(model.scenarioModel.playerSpawn.chosenOrientation == undefined){model.scenarioModel.playerSpawn.chosenOrientation = result[i].orient}
                console.log("after setting com values")
                console.log(result[i].orient)
                console.log(JSON.stringify(model.scenarioModel.playerSpawn))
    
            }
        }

    })
    

}


// by DISSONANT
    function rand_sphere_point(r) {

        function rand_logistic() {
            q = Math.random()
            return Math.log(q / (1 - q))
        }
    
        v = [0,0,0].map(rand_logistic)
    
        m = Math.sqrt(_.sum(v, function(x) {return Math.pow(x, 2)}))
    
        v = v.map(function(x) {return r * x / m})
    
        return v
    }

    model.sendJsonMessage = function(type,jsonObject){
        var scenariosIdentifier = "scenarios"
        var data  = {};
        data.identifier = scenariosIdentifier;
        data.jsonObject = jsonObject
        data.type = type
        
        model.send_message("json_message", data);
    }

    /**
     * 
     * "prefab": {
                "planet": 0,
                "centerPos": [100,100,100],
                "centerOrient":[0,0,0],
                "units": {
                    "/pa/units/land/energy_plant/energy_plant.json": {
                        "pos": [
                            [ -177.4828643798828, -344.97222900390625, -312.9060363769531 ],
                            [ -181.01220703125, -354.727783203125, -299.43267822265625 ]
                        ],
                        "orientation": [
                            [ 0.8785752654075623, -0.1692122220993042, -0.12924018502235413, 0.4275159239768982 ],
                            [ 0.8799293637275696, -0.17241352796554565, -0.1336355209350586, 0.4220658242702484 ]
                        ]
                    },
                   
                    }
                }
            }
        }


        This function 
     */

        
    model.convertDynamicPrefab = function(newCenter,radius,prefab){

     




    }
    //generates x random points on a sphere and returns an array containing them
    generateRandomPoints = function(r,numPoints){
        var pointsArray= [];
        for(var i = 0; i<numPoints; i++){pointsArray.push(rand_sphere_point(r))}
        return pointsArray;
    }
    generateValidRandomSpawns = function(r,numPoints,planet){
        var pointsArray= [];
        for(var i = 0; i<numPoints; i++){pointsArray.push(rand_sphere_point(r))}
        return validSpawns(pointsArray,planet);

    }
    //takes in an array of points and returns a sub array of all points close enough to the given point
    pointsInRange = function(originPoint,pointsArray,distanceMin,distanceMax){
        var returnArray = [];
        for(var i = 0; i<pointsArray.length;i++){
            var distance = distanceBetween(originPoint,pointsArray[i])
            if(distance < distanceMax && distance > distanceMin){returnArray.push(pointsArray[i])}
        }

    }
   