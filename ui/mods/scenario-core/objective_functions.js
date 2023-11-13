/*

this file contains all the functions that will  be called for checking and displaying objectives

the top half will be objectiveCheckFunctions that check the progress/fulfillment of an objective.

the bottom half are objectiveEffect functions and are ran when an objective becomes active. They are essentially built in triggers for each objective so that the scenario objectives don't require a bunch of starting triggers.

it is possible I will switch to them in future though.

e.g units in area will need an effect circle to signify the area.

*/



model.objectiveCheckFunctions = {};

model.objectiveEffectFunctions = {};

/*
------------------------------------------- [Objective Checks] -------------------------------------------
*/


/*
returns the number of units in an area.
basis for other area functions such as grabbing the types or id's of units in an area.

TODO needs array checks, same applys to functions it is calling.
*/


model.objectiveCheckFunctions["timed"] = function (timedObject){

    if(timedObject.activationTime == undefined && model.scenarioModel.fullTime !== 0){

        timedObject.activationTime = model.scenarioModel.fullTime
    }
    
    if((model.scenarioModel.fullTime - timedObject.activationTime)>timedObject.time){console.log("timed objective finished");return true}

}

model.objectiveCheckFunctions["gather"] = function (timedObject){//ammassing a certain amount of metal/power

    return;

}

model.objectiveCheckFunctions["survive_time"] = function (timedObject){

    if(timedObject.activationTime == undefined && model.scenarioModel.RealTimeSinceLanding >0){

        timedObject.activationTime = model.scenarioModel.RealTimeSinceLanding
    }
    
    if((model.scenarioModel.RealTimeSinceLanding - timedObject.activationTime)>timedObject.time){console.log("timed objective finished");return true}
    else{
        if(timedObject.activationTime == undefined){return 0}
        return model.scenarioModel.RealTimeSinceLanding - timedObject.activationTime
    }


}

model.objectiveCheckFunctions["build_units"] = function (timedObject){

    return;

}

//takes in a range of units, and whether it should trigger within or outside this range, does not return progress.
//if unittypes is true, units will be assumed to contain those and they will be used instead, to exclude scenario units I need to exclude nobuild by default.
model.objectiveCheckFunctions["unit_range"] = function (timedObject){
    console.log("unit range running")
    var promiseArray = [];
    if(timedObject["unit_types"] !== undefined){//TODO
        var unitTypes = timedObject.unit_types;
        var armyPromise = model.allPlayerArmy(model.armyIndex(), "",false,unitTypes)
        console.log("promise array push")
        promiseArray.push(armyPromise.then(function (playerArmy) {

            unitKey = _.keys(playerArmy)
            if(unitKey.length > 0){
                var unitAmount = 0;
                for(var i = 0;i<unitKey.length;i++){

                    unitAmount += playerArmy[unitKey[i]].length;
                }

                return unitAmount;
            }

            else{return 0}
        }));
        var returnVar = Promise.all(promiseArray)
  
    }
    else{
        var unitNames = timedObject.units.split(",");
        
        var armyPromise = model.playerArmy(model.armyIndex(), 0, unitNames[i])
        console.log("second promise array push")
        promiseArray.push(armyPromise.then(function (playerArmy) {

            unitKey = _.keys(playerArmy)
            if(unitKey.length == 1){

                return playerArmy[unitKey[0]].length;
            }

            else{return 0}
        }));
        var returnVar = Promise.all(promiseArray)
    }
   
    return returnVar.then(function(unitNumberArray){
       
        
        var unitTotal= 0;
        var numberArrayKeys = _.keys(unitNumberArray)
        console.log(unitNumberArray)
        for(var i = 0;i<unitNumberArray.length;i++){
          
            var unitCount = unitNumberArray[i];
            unitTotal += unitCount;
           
        }
      
        //return updated control array
        console.log(unitCount)
        console.log("unit count above")
        if(timedObject.range_type == "inside"){
            if(unitCount <= timedObject.range_higher && unitCount >= timedObject.range_lower){ return true;console.log("would have returned true")}
        
        }
        else{
            if(unitCount > timedObject.range_higher || unitCount < timedObject.range_lower){ return true;console.log("would have returned true")}
          
        }
    })
    
    

}

model.objectiveCheckFunctions["destroy_units"] = function (timedObject){//likely in area tracking id's is annoying

    return;

}


/**
 this function checks an arae for every players units and depending on settings will return who controls it, progress will be tracked by adding time whenever checked.


 it should return true if the player has controlled for needed time, otherwise increment the progress array for the player in control(this is annoying and will require seperate ui)
 */
model.objectiveCheckFunctions["control_area"] = function (objectiveObject, playerId){

    

    //for each player get the units within an area, if only 1 player has units within the area they get their time incremented
    for(var i = 0;i<objectiveObject.progress.length;i++){if(objectiveObject.progress[i]>=objectiveObject.needed && i == model.armyIndex()){return true}}
    var unitCount = objectiveObject.needed;
    var areaLocation = objectiveObject.location; // planet, center coordinates, and radius
    var allPlayerIds = model.scenarioModel.playerArray;
    for(var i = 0;i<allPlayerIds.length;i++){if(objectiveObject.progress[i] === undefined){objectiveObject.progress[i] = 0}}
    var promiseArray = [];
    for(var i = 0;i<allPlayerIds.length;i++){

        var armyPromise = model.playerArmy(allPlayerIds[i], areaLocation[0].planet, "", true)

       promiseArray.push(armyPromise.then(function (playerArmy) {

        var radiusPromise = new Promise(function (resolve, reject) { resolve(model.countArmyInRadius(playerArmy, areaLocation[0])); })

           return radiusPromise.then(function (units) {

                if (_.isArray(units)) {
                    if (units.length >= unitCount) { return true }
                
                    return units.length;

                }
                else {
                
                    if (units >= unitCount) { return true }
                    else { return units }


                }
            }).catch(function (err) { console.log(err) });
   
        }).catch(function (err) { console.log(err) }))

       
    }
    var returnVar = Promise.all(promiseArray)
    
   
    return returnVar.then(function(armyArray){

        //checks if a singular army controls the area, if so returns a new progress array
        //likely I will need to return player id's with the army functions to match the promise up
        
        var singleArmy = 0;
        for(var i = 0;i<allPlayerIds.length;i++){
            var unitCount = armyArray[i];
            if(unitCount>(0+objectiveObject.dont_count)){singleArmy++}
           
        }
        
        //return updated control array
        if(singleArmy === 1){

            for(var i = 0;i<armyArray.length;i++){

                if(armyArray[i] > (0+objectiveObject.dont_count)){objectiveObject.progress[i]+=1;return objectiveObject.progress}
            }

        }
    })
   
   

}


/**
 this function checks what units are within a defined area and depending on the objective will return whether they meet criteria

 */
model.objectiveCheckFunctions["units_in_area"] = function (objectiveObject, playerId) {

    var unitCount = objectiveObject.needed;
    var areaLocation = objectiveObject.location; // planet, center coordinates, and radius
    var unitType = objectiveObject.unitType; //the units file name
    var specificUnit = objectiveObject.specificUnit;
    var specificUnitId = objectiveObject.specificUnitId;
    if (unitType == undefined) { unitType = "" }

    //needs to be expanded for this to be useful
    if (specificUnit == true) { //currently only checks 1 id
        model.unitsInRadius(playerId, unitType, areaLocation).then(function (units) {
            if (_.contains(units, specificUnitId)) { return true }
            return 0;
        });

    }

    else {

        var armyPromise = model.playerArmy(playerId, areaLocation[0].planet, unitType, true)

        return armyPromise.then(function (playerArmy) {

            var radiusPromise = new Promise(function (resolve, reject) { resolve(model.countArmyInRadius(playerArmy, areaLocation[0])); })

           return radiusPromise.then(function (units) {

                if (_.isArray(units)) {
                    if (units.length >= unitCount) { return true }
                    return units.length;

                }
                else {

                    if (units >= unitCount) { return true }
                    else { return units }


                }
            }).catch(function (err) { console.log(err) });
   
        }).catch(function (err) { console.log(err) })


    }

}

/*
------------------------------------------- [Objective Effects] -------------------------------------------

these are activated when objectives move to active and removed when the objective is finished
*/




/*
spawns a colored ring at a chosen location with a size roughly equal to the circle made by the given radius.
*/
model.objectiveEffectFunctions["radius_ring"] = function (objectLocation, duration) {

    
    var location = {};
    location.planet = objectLocation[0].planet;
    location.pos = objectLocation[0].pos;
    location.radius = objectLocation[0].radius;
    //given location is planet and position
    
    console.log(JSON.stringify(location)+" | "+duration)
    

    /*
     spawn puppeteted ring effect at location for duration. if duration not specified set to not delete

     returns puppetid so it can be deleted if objective is completed.

     size is calculated and changed via scale
      
      
     */


    //edit location to contain needed scale
    
    location.scale = location.radius/6;
    //location.scale = 1;
    delete location.radius;
    
    var effectPromise = api.puppet.createEffect("pingRed",location,duration,true);

    return effectPromise;


}

/**
 * 
 * an objective that takes in some parameters from the object and periodically spawns waves of units that scale by some variable(probably time)
 * 
 * there would be a difficulty number, scaling ratio(difficulty increase vs time), initial difficulty, and max difficulty
 * 
 * it could also specify what units can be spawned and their difficulty tier
 * 
 * spawn points would be specified along with what radius around them to spawn in
 * 
 * waves would be spawned and given to the enemy ai with compositions based on the difficulty tier of the unit, there would be some kind of ratio of expensive vs cheaper units for a nice balance
 * 
 * could have a timer attached if needed
 * 
 * adding a end objective field to objectibes would let me end other objectives on certain conditions which would be cool
 */
validPointsMap = {}

model.objectiveCheckFunctions["spawn_waves"] = function (waveObject){
    if(model.paused() == true || model.isSpectator() == true || model.gameOver() == true || model.scenarioModel.landTime == 200000){return}
    if(model.serverRate() < 0.3){model.triggerFunctions["kill_all_invincible_ai"]({})}//kill switch if server has went to shit, requires ai to use the ai invincible com
    if(model.serverRate() < 0.25){model.triggerFunctions["wipe_planet"]({}) ;return}
    if(model.serverRate() < 0.6){return}//dont try and spawn a wave when the server is already slow
    
    var planetRadius = 500
    var planets = model.planetListState()

    planets = planets.planets
    for(planetIndex in planets){
     
        if(planets[planetIndex].id == waveObject.planet){planetRadius = planets[planetIndex].radius}
    }
  
    
    var army = []
    var controllingPlayer = 0;
    var playerController =false
    if(waveObject.playerType == "ai"){
        players = model.players()
        for(playerIndex in players){
            var player = players[playerIndex]
            if(player.ai == true && player.stateToPlayer == "hostile" && playerController == false){
                controllingPlayer = playerIndex
            }
            if(player.econ_rate == 0.1){

                controllingPlayer = playerIndex
                playerController = true
            }
            
            else{
                army.push(model.playerArmy(playerIndex,waveObject.planet,"",true,waveObject.dont_spawn_near_unit_type))
                army.push(model.playerArmy(playerIndex,waveObject.planet,"",true,"UNITTYPE_Commander"))
            }

        }

    }
    if(controllingPlayer == model.armyIndex()){return}
   
    var allArmy = Promise.all(army)
    var scalingRatio = 0
    allArmy.then(function(result){
        
        var locations = []
        for(armyIndex in result){
     
        for(unitIndex in result[armyIndex]){
            unit = result[armyIndex][unitIndex]
            if(unit !== undefined){
                if(unit == undefined){continue} 
                if(unit.built_frac == undefined){
                    locations.push(unit.pos)
                }
               }
          
        }

         }

         function randomPoint(){
            var maxDist = waveObject.spawn_close_radius
            if(maxDist == undefined){maxDist = 2000}
            var posArray = rand_sphere_point(planetRadius)
            if(waveObject.dont_spawn_radius !== undefined){
               
                var tooClose = false
                var closeEnough = false
                for(var locationIndex in locations){
                   
                  
                var distance = model.distanceBetween(posArray, locations[locationIndex])
                if(distance < waveObject.dont_spawn_radius){
                    
                    tooClose = true
                   
                }
                else {

                    if (distance < maxDist) {closeEnough = true}
                }
                }
                if(locations.length <1){closeEnough = true}
                if(tooClose == true || closeEnough == false){ return randomPoint()}
                else{return posArray}
            }
            }
        if(waveObject.planet !== undefined){//planet rather than location based wave spawning

            var effectNeeded = (waveObject.spawnEffect !== undefined)
          
            if((model.scenarioModel.RealTimeSinceLanding)%waveObject.waveInterval >0 && (model.scenarioModel.RealTimeSinceLanding%waveObject.waveInterval <2 && waveObject.timesCalled >0) && waveObject.lastCalled !==(model.scenarioModel.RealTimeSinceLanding)){//if it is time to spawn a wave
                waveObject.lastCalled;
                console.log("spawning wave with difficulty value of "+waveObject.progress)
           
                var waveUnits = _.keys(waveObject.unitValues)
                var groupSpawnPoint = randomPoint()
                var randomNum = Math.random()
                // if(effectNeeded == true && waveObject.effectContext == "groups"){
                 
                //     var effectJson = {
                //         effectName:"burrow",
                //         duration:waveObject.spawnEffectDuration,
                //         location: groupSpawnPoint
                //     }
                //     model.sendJsonMessage("spawnEffect",effectJson)
                // }

                //for each wave 
                var totalChance = 0
                var pickedWave = false;
               
                for(waveIndex in waveUnits){
                    if(pickedWave == true){continue}
                   
                    var waveChance = waveObject.unitValues[waveUnits[waveIndex]].waveChance
                    totalChance += waveChance
                   
                    if(randomNum<=totalChance){

                        waveUnits = waveObject.unitValues[waveUnits[waveIndex]]
                        pickedWave = true
                        
                    }
                }
               
                if(pickedWave == false){waveUnits = waveObject.unitValues[waveUnits[0]]}
                var unitsToBeSpawned = [];
                for(groupIndex in waveUnits){//for each unit group in the wave
                    if(groupIndex == "waveChance"){continue}
                   
                    var unitGroupObject = waveUnits[groupIndex]
                    var groupValue = waveObject.progress/unitGroupObject.value 
                    // console.log(groupValue)
                    // console.log(locations.length)
                    // console.log(waveObject.accelerate_value)
                    if(waveObject.accelerate_by_dont_spawn_type == true){groupValue = groupValue +( groupValue * locations.length*waveObject.accelerate_value/(model.players().length-1))}
                   //console.log(groupValue)
                  
                    for(unitIndex in unitGroupObject.units){// for each unit in the group
                        var unit = unitGroupObject.units[unitIndex]
                        var unitValue = unit[1]
                        var unitName = unit[0]
                        var unitScalingNumber = unit[2]
                        var unitRatio = unitScalingNumber/groupValue
                        
                        //if(unitGroupObject.units.length>1){unitRatio = unitRatio + (-0.1 * Math.pow((0.015*(groupValue/unitValue)),2)) + 0.004*groupValue}
                        if(unitRatio>1){unitRatio = 1}
                        if(unitRatio<0){unitRatio = 0}
                        
                        var unitsNeeded = unitRatio*groupValue/unitValue
                        unitsNeeded = Math.floor(unitsNeeded)
                      
                        console.log("spawning "+unitsNeeded+" "+unitName)


                        
                      
                        if(waveObject.spreadGroupSize == undefined){waveObject.spreadGroupSize = 0}
                        for(var points = 0; points<unitsNeeded;points++){// queuing up many random movement commands, move doesnt have the pausing of patrol
                            if(groupValue<0){ continue}
                            unitsToBeSpawned.push(unitName)
                            
                            groupValue -= unitValue
                             
                         }

                    }
         
                }

                var groupCounter = 0;
                unitsToBeSpawned = _.shuffle(unitsToBeSpawned);
                unitsToBeSpawned.forEach(function(unitName){

                    if(waveObject.group == false){
                        if(groupCounter == waveObject.spreadGroupSize){
                            groupSpawnPoint = randomPoint();
                            groupCounter = 0;
                        }
                        else{groupCounter += 1}
                    }
                   // console.log("unit to be spawned from array ",unitName)
                    model.spawnExact(controllingPlayer,unitName,waveObject.planet,groupSpawnPoint,[0,0,0]);

                })
                
    
            }
           
        }


    }).catch(function(err){console.log(err)})
    if((model.scenarioModel.RealTimeSinceLanding)%waveObject.waveInterval >0 && (model.scenarioModel.RealTimeSinceLanding%waveObject.waveInterval <2 && waveObject.timesCalled >0 && waveObject.lastCalled!==model.scenarioModel.RealTimeSinceLanding)){scalingRatio = (waveObject.scalingRatio*waveObject.progress)}
    var difficultyIncrease = waveObject.scalingNumber + scalingRatio
    var returnValue = waveObject.progress+difficultyIncrease
    return returnValue;//raises the difficulty
   




}

model.objectiveCheckFunctions["destroyed_metal_counter"] = function (counterObject){//used to track kills etc in custom modes
    var metalDestroyed = model.enemyMetalDestroyed();
    if(counterObject.progress >= counterObject.needed){return true}
    if(counterObject.counterValue !== undefined){return metalDestroyed/counterObject.counterValue}

    else{return metalDestroyed}

}





model.objectiveCheckFunctions["players_alive"] = function (waveObject){
    var players = model.players()
    var humanPlayers = 0
    var aiPlayers = 0
    for(playerIndex in players){
        var player = players[playerIndex]
        if(player.ai == 1 && player.defeated == false){aiPlayers +=1}
        if(player.ai !== 1 && player.defeated == false){humanPlayers +=1}
    }
    var totalPlayers = humanPlayers + aiPlayers

    if(waveObject.totalAlive !==undefined){if(waveObject.totalAlive == totalPlayers){return true}}

    if(waveObject.humanAlive !==undefined){if(waveObject.humanAlive == humanPlayers){return true}}

    if(waveObject.aiAlive !==undefined){if(waveObject.aiAlive == aiPlayers){return true}}

}

model.objectiveCheckFunctions["change_buildable"] = function (buildObject){
    
}