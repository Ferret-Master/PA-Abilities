//functions needed for battle royale that are not used elsewhere


//replace unit, will be used for upgrading/healing


//replace all units(for healing)


//reward metal, gives players metal based on metal destroyed vs their metal already given


//spawn neutrals, nest like spawn of neutral units


//update marker positions

var updateMarkerPositions = function(planet, markerType){
    players = model.players()
    army = []
    for(playerIndex in players){
        var player = players[playerIndex]
        if(player.ai == true && player.stateToPlayer == "hostile"){
            //ai player
        } 
        else{
            army.push(model.playerArmy(playerIndex,planet,"",true,markerType))
        }

    }
    var allArmy = Promise.all(army)
    allArmy.then(function(result){
     
        var locations = []
        for(armyIndex in result){
     
        for(unitIndex in result[armyIndex]){
            unit = result[armyIndex][unitIndex]
     
            if(unit !== undefined){if(unit == undefined){continue}  if(unit.built_frac == undefined){
                locations.push(unit.pos)
            }}
          
        }
    }

    var markerPoints = locations
    return markerPoints;
})
}


//get planet radius(from hive mode)

var getPlanetRadius = function(planetId){
    var planets = model.planetListState()
    planets = planets.planets
    for(planetIndex in planets){
    
        if(planets[planetIndex].id == planetId){
            return planets[planetIndex].radius
        }
    }
}

var isPlayerX = function(slotNum){
    players = model.players()
  
    var playerFound = false;
    for(var i = 0;i<players.length;i++){
        if(players[i].ai == 0 && players[i].defeated == false && playerFound == false){
                var playerSlot = i;
                playerFound = true;
        }
    }
    if(model.armyIndex() !== playerSlot){return false}
    else{return true}
}

var getAiPlayer = function(){
    players = model.players()
            for(playerIndex in players){
                var player = players[playerIndex]
                if(player.ai == true && player.stateToPlayer == "hostile"){
                    return parseInt(playerIndex)
                }
            }
},

generateValidRandomSpawnsOutsideMarker = function(r,numPoints,planet,spec,ignoreFeatures, markerPoints){//similar to the above but returns the requested number rather than only working ones from that amount, hopefully at least
    points = filterValidRandomSpawns(r,numPoints*10,planet,spec,ignoreFeatures)
    return points.then(function(result){
        var returnedPoints = [];
        var tempPoints = pointsInArrayBands(result,markerPoints,300,2000);

        for(var i = 0;i<numPoints;i++){

            if(tempPoints.length>i){
                returnedPoints.push(tempPoints[i]);
            }
        }
       
     
        return returnedPoints;
    })
}