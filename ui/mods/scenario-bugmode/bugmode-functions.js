
//valid spawns(not in cssg/water/lava)
function filterValidpoints(pointArray){


}


function generatePlanetPoints(r){
    //spawn point generation, need a large initial amount generated so that there is not major structure stacking
    return model.generateRandomPoints(r, 1000)

}

//valid spawns(not in cssg/water/lava)

//valid spawns in area(spawns appear in bounded area centered on point)

//valid spawn in any point array band(used for control towers/creep spawning), can chain this for upgraded spawning. if required is ticked will return 0 points if missing areas
function pointsInArrayBands(points,areaPoints,bandLower,bandHigher,required){
    if(bandLower == undefined){bandLower = 0}
    if(bandHigher == undefined){bandHigher = 2000}
    var returnArray = [];
    var tooClose = false;
    var closeEnough = false;
    if(areaPoints == undefined && required !== true){return points}
    if(areaPoints.length < 1 && required !== true){return points}
    points.forEach(
        function(point){
            tooClose = false;
            closeEnough = false;
            for(var locationIndex in areaPoints){
               
            var distance = model.distanceBetween(point, areaPoints[locationIndex])
            if(distance < bandLower){
                
                tooClose = true
               
            }
            else {

                if (distance < bandHigher) {closeEnough = true}
            }
            }
            if(tooClose == false && closeEnough == true){returnArray.push(point)}
          
    }
    )
 
    return returnArray;

    

}

function clearAndReplaceAtPosition(player, position, unit,planet){//spawns a unit that immediatly destroys whatever it is on then a few seconds later spawns the specified replacement unit
    model.spawnExact(player,"/pa/units/land/clear_position/clear_position.json",planet,position,[0,0,0]);
    _.delay(function(){model.spawnExact(player,unit,planet,position,[0,0,0])},3000)
}
//random valid spot function

//spawn bug


//spawn roaming bug



//spawns non objective map stuff
//includes things like reclaimable rocks, neutral units, supply caches





function validSpawns(points,planet,spec,ignoreFeatures){//takes in array of points and returns valid ones

    fixupPointsArray = [];
    for(var i = 0;i < points.length;i++){
    var pointLoc = {}
    pointLoc.pos = points[i]
    fixupPointsArray.push(pointLoc)
   
 
    
}

var result = engine.call('worldview.fixupBuildLocations', world.id, spec, Number(planet), JSON.stringify(fixupPointsArray)).then(function(ready) {
    

   
            
    var returnArray = []
    ready = JSON.parse(ready)
    for(var i = 0;i < ready.length;i++){
       
        var fixupResult = ready[i]

           
           
         
            
            if(fixupResult.ok == false || fixupResult.desc !== undefined && !((fixupResult.desc == "feature warning" || fixupResult.desc == "hit structure") && ignoreFeatures == true)){
                
                //console.log(fixupResult.desc)
            
                

            }
            else{returnArray.push(fixupResult.pos)}
       

        }
        
        //console.log("returning checked array")
        return returnArray;
                                        
                                        
        })
return result
}


filterValidRandomSpawns = function(r,numPoints,planet,spec,ignoreFeatures){
    var pointsArray= [];
    for(var i = 0; i<numPoints; i++){pointsArray.push(rand_sphere_point(r))}
    var temp = validSpawns(pointsArray,planet,spec,ignoreFeatures)
   

    return temp;

}

generateValidRandomSpawns = function(r,numPoints,planet,spec,ignoreFeatures){//similar to the above but returns the requested number rather than only working ones from that amount, hopefully at least
    points = filterValidRandomSpawns(r,numPoints*10,planet,spec,ignoreFeatures)
    return points.then(function(result){
        var returnedPoints = [];
        for(var i = 0;i<numPoints;i++){
            returnedPoints.push(result[i])
        }
        return returnedPoints
    })
}

generateValidRandomSpawnsOutsideTower = function(r,numPoints,planet,spec,ignoreFeatures){//similar to the above but returns the requested number rather than only working ones from that amount, hopefully at least
    points = filterValidRandomSpawns(r,numPoints*10,planet,spec,ignoreFeatures)
    return points.then(function(result){
        var returnedPoints = [];
        var tempPoints = pointsInArrayBands(result, bug_standard.dontSpawnPoints,300,2000);

        for(var i = 0;i<numPoints;i++){

            if(tempPoints.length>i){
                returnedPoints.push(tempPoints[i]);
            }
        }
       
     
        return returnedPoints;
    })
}

