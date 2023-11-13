//battle royale code, main loop and complex stuff here
BRObject = {
    initialSetup:false,
    playerAlive:false,
    planet:0, //assume single planet for now
    planetRadius:500,
    neutralPlayer:undefined,

    startingUnit:"",
    neutralMarker:"",
    marker:"", //globally visible unit to mark spawn locations

    easyNeutral:"/pa/units/land/assault_bot/assault_bot.json",

    respawnTimer:60, //time to respawn after a death
    commanderPosition:undefined, //unsure if needed
    playerComPositions:[],// needed to avoid spawning things on spawn units
    playerSlot:undefined,
    playerUnitArray:[],



    spawnStartingUnit:function(){
        //use build at existing unit to spawn starting bot
        var spawnAtObject = {
            "name": "starting spawn",
            "id": 99,
            "delay": 0,
            "planet":0,
            "type": "build_at_existing_unit",
            "special":"unit type",
            "unitType":"UNITTYPE_Commander",
            "newUnitName":[[this.startingUnit,1], [this.marker, 1]]
            
        }
        model.triggerFunctions["build_at_existing_unit"](spawnAtObject);
        
    },
    spawnStartingNeutrals:function(){// spawns starting neutral enemies around the map but avoids com spawns
        generateValidRandomSpawnsOutsideMarker(this.planetRadius,1,this.planet,this.neutralMarker, this.playerComPositions).then(function(points){
        
            var validPoints = points;
        
    
            validPoints.forEach(function(point){
         
            model.spawnExact(this.neutralPlayer,this.easyNeutral, this.planet,point,[0,0,0])
            model.spawnExact(model.armyIndex(),"/pa/units/land/temp_vision_small/temp_vision_small.json", this.planet,point,[0,0,0])
        
        })
        bug_standard.startComplete = true;
    
        })
    },
    respawnPlayer:function(){//triggers respawn sound cue a few seconds prior, spawns and re centers camera for player
        //play cue

        //center camera

        //spawn unit


    },
    setupBR:function(){
        this.neutralPlayer = getAiPlayer();
        BRObject.spawnStartingUnit(); 
        this.planetRadius = getPlanetRadius(this.planet)
        this.playerComPositions = updateMarkerPositions(this.planet, "UNITTYPE_Shield")
        _.delay(BRObject.spawnStartingNeutrals(),5000)
        BRObject.initialSetup = true;
    }


}

//main function, belongs at the bottom of this file
//reads in the object for the mode
model.objectiveCheckFunctions["battle_royale"] = function (BRObjective){ 
    if(BRObject.initialSetup == false && model.scenarioModel.RealTimeSinceLanding > 1 && model.scenarioModel.RealTimeSinceLanding < 20){// if the game has started and needs to be setup, also do not run if player crashed and rejoined
        BRObject.setupBR();
        return 10;
    }
   
    
}