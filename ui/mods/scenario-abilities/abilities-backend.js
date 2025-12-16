//backend logic

//abilities can either work via detecting spawned/built unit(alt fire for spawned projectile), alternatively instead of built it intercepts the command and spawns stuff
//will likely use all the above methods depending on ability

//units are checked, if they are not in the map they are added and have their function ran, if they are ignore them

var abilities_enabled = true; //enabled per scenario

var a_unitMap = {}

var a_unitsToCheck = [ //units that need state info/actions applied

]

var a_unitAbilityMap = {
    "/pa/units/abilities/summon/summon_dox.json":"summon_dox"
}

var unitsToRun = []//units that need to have their state checked and ability ran

model.abilityQueue = []//abilities triggered by anything end up here in the end, can be added to by other functions

a_armyLoop = function(delay){

var a_armyPromise = model.allPlayerArmy(model.armyIndex())
        
a_armyPromise.then(function(result){// adds ability units to map
    
    a_unitsToCheck.forEach(function(unitSpec){
        var unitIds = result[unitSpec];
        var tempArray = [];
        for(var i = 0; i< unitIds.length;i++){
            if(a_unitMap[unitIds[i]] == undefined){
                tempArray.push(unitIds[i])
            }
        }
        var unitDataPromise = api.getWorldView(0).getUnitState(tempArray)
        unitDataPromise.then(function(ready){

            for(var i = 0; i<ready.length;i++){
                a_unitMap[tempArray[i]] = ready[i]
                unitsToRun.push([tempArray[i],unitSpec])
            }

        })
    })
    

})
_.delay(a_armyLoop, delay)
}



a_run_ability = function(delay){
    //if unitsToRun is not empty grab the unit map data and add the ability to the queue/delete the unit
    unitsToRun.forEach(function(idSpecArray){
        var unitState = a_unitMap[idSpecArray[0]]
        var ability = a_unitAbilityMap[idSpecArray[1]]
        var abilityObject = {
            ability:ability,
            planet:unitState.planet,
            location:unitState.pos
        }
        model.abilityQueue.push(abilityObject)
    })


    //if ability queue is not empty run the appropriate ability
    model.abilityQueue.forEach(function(abilityObject){
        if(model.abilities[abilityObject.ability] !== undefined){
            model.abilities[abilityObject.ability](abilityObject.planet, abilityObject.location)
        }
    })
    _.delay(a_run_ability,delay)
}

if(abilities_enabled){
    activateAbilities()
}

function activateAbilities(){
    a_run_ability(100)
    a_armyLoop(500)
}


//ability is attempted
/**
 * ability is checked against database for things like range,
 * check if hero is close enough to cast it
 * if so spawn the ability, also switches location to hero if needed
 */
var abilityAttempt = function(abilityObject){
    var abilitySpec = abilityObject.ability;
    var abilityRange = abilityObject.range;
    var scale = api.settings.getSynchronous('ui', 'ui_scale') || 1.0;
    var clientX = Math.floor(cursor_x * scale);
    var clientY = Math.floor(cursor_y * scale);
    mouseLocationPromise = model.holodeck.raycastTerrain(clientX,clientY);
    mouseLocationPromise.then(function(mouseLocation){
    
        var abilityTarget = mouseLocation.pos;
        api.getWorldView(0).getArmyUnits(model.armyIndex(),last_stand.planetId).then(function(result){
            var heroId = result[localStorage.chosenHero];
            if(heroId !== undefined){
                api.getWorldView(0).getUnitState(heroId).then(function(result){
                    var heroLocation = result[0].pos;
                    // console.log(result[0], heroLocation)
                    // console.log(model.distanceBetween(abilityTarget,heroLocation))
                    // console.log(abilityRange)
                    if(model.distanceBetween(abilityTarget,heroLocation) < abilityRange){
                        //console.log(abilitySpec)
                        if(_.contains(selfCast,abilitySpec)){abilityTarget = heroLocation}
                        model.abilities[abilitySpec](abilityTarget)
                       //console.log("cast ability")
                    }
                })
            }
        })
    })
}

var scaleMouseEvent = function(mdevent) {
    if (mdevent.uiScaled)
        return;
    mdevent.uiScaled = true;
    var scale = api.settings.getSynchronous('ui', 'ui_scale') || 1.0;
    mdevent.offsetX = Math.floor(mdevent.offsetX * scale);
    mdevent.offsetY = Math.floor(mdevent.offsetY * scale);
    mdevent.clientX = Math.floor(mdevent.clientX * scale);
    mdevent.clientY = Math.floor(mdevent.clientY * scale);
};

var selfCast = ["/pa/units/heroes/abilities/seeking_blast/seeking_blast.json","/pa/units/heroes/abilities/healing_aura/healing_aura.json"]

model.endFabMode = function () {
    if(activeBuildId !== undefined){
        if(activeBuildId.startsWith("/pa/units/heroes/abilities/")){
            sendAbilityInfo(cursor_x, cursor_y, activeBuildId)
        }
    }
    model.mode('default');
    api.arch.endFabMode();
    model.currentBuildStructureId('');
}

var sendAbilityInfo =  function(cursor_x, cursor_y, unitSpec){

    
    var abilityObject = {
        "cursor_x":cursor_x,
        "cursor_y":cursor_y,
        "ability":unitSpec,
        "range":300
    }

    abilityAttempt(abilityObject)


}

var activeBuildId = undefined;
handlers.activeBuildId = function(id){
    activeBuildId = id;
}