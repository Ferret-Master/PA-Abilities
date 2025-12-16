//contains logic for last stand style game mode scenario
var notController;

var last_stand = {
    //this needs to be expanded with each unit type to facilitate upgrades
   objectiveObject:undefined,
   waveObject:undefined,
   gameOver:false,
   waveSpawnPoints:[],
   waveSpawner:"/pa/units/last_stand/wave_spawner/wave_spawner.json",
   waveEffect: "/pa/units/last_stand/wave_spawner/wave_effect_spawner.json",
   currentHero:undefined,
   enemyPlayer:undefined,
   planetRadius:undefined,
   planetId:undefined,
   startComplete:false,


//sets up the map for last stand, given that it is a set map it applies visuals and spawns necessary starting units
setupMap:function (){

    
    
    last_stand.startComplete = true;



},

//spawns visual effect to indicate that a wave is about to spawn, possibly one for the spawn itself as well
spawnWaveEffects:function(waveSpawnPoints){

    players = model.players()
    wavePlayer = 0;
    wavePlayerFound = false;
    for(var i = 0;i<players.length;i++){
        if(players[i].ai == 0 && players[i].defeated == false && wavePlayerFound == false){
                wavePlayer = i;
                wavePlayerFound = true;
        }
    }
    if(model.armyIndex() !== wavePlayer){notController = true}
    waveSpawnPoints.forEach(function(point){
    //if player is the controller spawn the effect units
    if(!notController == true){
        model.spawnExact(last_stand.enemyPlayer,last_stand.waveEffect, last_stand.planetId,point[1],[0,0,0])
}
   })

},

//takes in a 2d array  and spawns units at each hive based on its type, has a difficulty multiplier for easier scaling
spawnWave:function(waveSpawnPoints,waveObject,waveNumber, totalSpawnNumber){
    console.log("trying to spawn wave")
    players = model.players()
    wavePlayer = 0;
    wavePlayerFound = false;
    for(var i = 0;i<players.length;i++){
        if(players[i].ai == 0 && players[i].defeated == false && wavePlayerFound == false){
                wavePlayer = i;
                wavePlayerFound = true;
        }
    }
    if(model.armyIndex() !== wavePlayer){notController = true}
    var wave = waveObject.waves[waveNumber]
    var minions = wave.unitsPerSpawn
    var minionsKeys = _.keys(minions)
    var elites = wave.elites
    var elitesKeys = _.keys(elites)

    var usedNumbers = []
    var totalSpawns = waveSpawnPoints.length;
    var spawnsToUse = []
    for(var i = 0;i<totalSpawnNumber;i=i){
        var randomValue = Math.floor(Math.random()*totalSpawns)
        if(usedNumbers.length == totalSpawns){usedNumbers = []}
        if(_.includes(usedNumbers, randomValue) == false){//unused value
            spawnsToUse.push(randomValue);
            i++;
        }
    }
    //console.log(spawnsToUse)
    for(var i = 0;i<spawnsToUse.length;i++){
        if(i == 0 && elites !== undefined){ //spawn elites instead of minions in a spawn
           console.log("spawning elites")
           elitesKeys.forEach(function(eliteSpec){
                for(var j = 0;j<elites[eliteSpec];j++){
                    model.spawnExact(last_stand.enemyPlayer,eliteSpec, last_stand.planetId,waveSpawnPoints[spawnsToUse[i]],[0,0,0])
                }
           })
        }
        else{
            console.log("spawning minions")
            minionsKeys.forEach(function(minionSpec){
                console.log(minionSpec)
                console.log(minions[minionSpec])
                for(var j = 0;j<minions[minionSpec];j++){
                    console.log(waveSpawnPoints[spawnsToUse[i]])
                    model.spawnExact(last_stand.enemyPlayer,minionSpec, last_stand.planetId,waveSpawnPoints[spawnsToUse[i]],[0,0,0])
                }
           })
        }
        
    }
},
checkWaveComplete:function(){//checks if no enemy units exist
    model.playerArmy(last_stand.enemyPlayer,last_stand.planetId,"",true,"UNITTYPE_Custom57").then(function(result){
        if(result.length < 1){last_stand.waveComplete()}
    })
},

//maps revives to army/status
/**
 * format is army:{unitSpec, initialReviveTime, reviveLocation}
 * if timeStoodNear becomes greater than that units revive value it is destroyed and the hero is respawned(hopefully with less health)
 */
reviveTimeNeeded : 8,
initialReviveTime:0,

handleRevives:function(){
    var playerArmyArray = []
    var players = model.players()
    for(var i = 0;i<players.length;i++){//puts each players hero/revives states into promise
        if(players[i].ai == 0){
            playerArmyArray.push(model.playerArmy(i,last_stand.planetId,"",true,"UNITTYPE_Custom56"))
        }
    }
    var revivesPromise = Promise.all(playerArmyArray);
    var reviveReset = true;
    var heroLocations = [];
    var reviveLocation =  undefined;
    var reviveSpec = undefined;
    revivesPromise.then(function(playerArmyArray){//works out revives. promise gives us state info on heros and revives
        for(var i = 0;i<playerArmyArray.length;i++){//for each player
            for(var j = 0;j<playerArmyArray[i].length;j++){//for each player hero and revive
                var playerReviveOrHero = playerArmyArray[i][j]// the revive or hero unit

                if(playerReviveOrHero.unit_spec.endsWith('revive.json') && model.armyIndex() == playerReviveOrHero.army){//if it is a revive set up the status, this part works fine
                    reviveLocation = playerReviveOrHero.pos;
                    reviveSpec = playerReviveOrHero.unit_spec
                }
                else{//for each hero unit
                    heroLocations.push(playerReviveOrHero.pos);//that units position
                }
            }
        }

        if(reviveLocation !== undefined){//if you need to be revived
            for(var i = 0;i<heroLocations.length;i++){
                if(model.distanceBetween(heroLocations[i], reviveLocation) < 35){
                    if(last_stand.initialReviveTime == 0){
                        last_stand.initialReviveTime = Date.now()/1000; 
                    }
                    if(Date.now()/1000 - last_stand.initialReviveTime > last_stand.reviveTimeNeeded){
       
                        last_stand.reviveHero(reviveLocation, reviveSpec)
           
                        return;
                    }
                    reviveReset =false;
                }
            }
        }
        if(heroLocations.length < 1){
            last_stand.loseGame();
        }
        if(reviveReset ==true){last_stand.initialReviveTime = 0}
    
    })
    
    
},
//model.spawnExact(model.armyIndex(),last_stand.currentHero, last_stand.planetId,last_stand.reviveStatusMap[0].reviveLocation,[0,0,0], true)
reviveHero:function(location, reviveUnit, healthPercentage){
    console.log(location, reviveUnit)
    if(last_stand.currentHero == undefined){last_stand.currentHero = localStorage.chosenHero}

    //spawn damage on hero

    //kill revive
    api.getWorldView(0).getArmyUnits(model.armyIndex(),last_stand.planetId).then(function(result){
       
        var hero = result[last_stand.currentHero]
        if(hero == undefined){hero = []}
        var reviveId = result[reviveUnit];
        if(hero.length<1 ){
            model.spawnExact(model.armyIndex(),last_stand.currentHero, last_stand.planetId,location,[0,0,0], true)//respawns hero
        }
        api.getWorldView(0).sendOrder({units: reviveId,command: 'self_destruct', group:true});
    })

},

loseGame:function(){//ends the game and calcs meta stuff if needed
    console.log("you lost the game")
},

waveComplete:function(){
    waveCounter = 20;
    waveComplete = true;
},
getEnemyPlayer:function(){
    players = model.players()
            for(playerIndex in players){
                var player = players[playerIndex]
                if(player.ai == true && player.stateToPlayer == "hostile"){
                    controllingPlayer = playerIndex
                }
                if(player.econ_rate == 0.1){
    
                    controllingPlayer = playerIndex
              
                }
    
            }
            this.enemyPlayer = parseInt(controllingPlayer);
},
getPlanetRadius:function(){
    var planets = model.planetListState()

    planets = planets.planets
    for(planetIndex in planets){
    
        if(planets[planetIndex].id == this.objectiveObject.planet){
            this.planetRadius = planets[planetIndex].radius
            this.planetId = this.objectiveObject.planet
        }
    }
},
triggerWin:function(){
    playersWon = true;
    model.triggerFunctions["kill_all_invincible_ai"]();
}


}
var waveNumber = -1;
var waveComplete = true;
var waveCounter = 10;
var visionSpawned = false;
var playersWon = false;
if(localStorage.chosenHero == undefined){localStorage.chosenHero = "/pa/units/heroes/wizard/wizard.json";}

model.objectiveCheckFunctions["last_stand"] = function (objectiveObject){
    last_stand.objectiveObject = objectiveObject;
    last_stand.waveSpawnPoints = objectiveObject.waveSpawns;
    last_stand.planetId = objectiveObject.planetId;
    if(last_stand.waveObject == undefined){
        $.getJSON(objectiveObject.waves).then(function(imported) {last_stand.waveObject = imported})
    }
    if(model.paused() == true || model.isSpectator() == true || model.gameOver() == true || model.scenarioModel.landTime == 200000){return}
    if(model.serverRate() < 0.3){model.triggerFunctions["kill_all_invincible_ai"]({})}//kill switch if server has went to shit, requires ai to use the ai invincible com
    if(model.serverRate() < 0.25){model.triggerFunctions["wipe_planet"]({}) ;return}
    if(model.serverRate() < 0.6){return}//dont try and spawn a wave when the server is already slow
    last_stand.handleRevives();
    waveCounter -= 1;

    if(last_stand.enemyPlayer == undefined){

        last_stand.getEnemyPlayer();
    }
    if(last_stand.planetRadius == undefined){
        
        last_stand.getPlanetRadius();

    }
    

    if(waveComplete == false){
        last_stand.checkWaveComplete();
    }
  
    if(waveComplete && waveCounter < 0){//if it is time to spawn a wave

        waveNumber += 1;
        if(waveNumber>last_stand.waveObject.waves.length){
            last_stand.triggerWin()
        }
        waveComplete = false;
        //last_stand.spawnWaveEffects(last_stand.waveSpawnPoints);

        _.delay(function(){

        //do wave stuff

        last_stand.spawnWave(last_stand.waveSpawnPoints, last_stand.waveObject, waveNumber, model.players().length)

        },5000)
        
        
        


    }
   
    objectiveObject.lastCalled = model.scenarioModel.RealTimeSinceLanding;
    if(last_stand.waveSpawnPoints.length<1 && last_stand.startComplete == false){return 10}
    if(last_stand.waveSpawnPoints.length>0 && last_stand.startComplete == false){last_stand.setupMap()}
    //perform setup
    
    if(last_stand.gameOver && model.scenarioModel.RealTimeSinceLanding > 100){model.triggerFunctions["kill_all_invincible_ai"]({})}//if all creep and hives have been defeated kill the bug ai
    return 10;//dummy value since progress is not timed based directly
}   