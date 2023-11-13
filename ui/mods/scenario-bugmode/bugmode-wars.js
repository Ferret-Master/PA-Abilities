/**
 * In bug wars each player spawns their own bugs and once I expand it can upgrade them?
 * 
 */

model.objectiveCheckFunctions["bug_wars"] = function (waveObject){
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
    army.push(model.playerArmy(model.armyIndex(),waveObject.planet,"",true,waveObject.dont_spawn_near_unit_type))
    controllingPlayer = model.armyIndex()
   
    var allArmy = Promise.all(army)
    var scalingRatio = 0
    allArmy.then(function(result){
        
        var locations = []
        for(armyIndex in result){
     
        for(unitIndex in result[armyIndex]){
            unit = result[armyIndex][unitIndex]
            if(unit !== undefined){if(unit == undefined){continue} locations.push(unit.pos)}
          
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
                if(locations.length <1){return false}
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
                            if(groupSpawnPoint == false){return}
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