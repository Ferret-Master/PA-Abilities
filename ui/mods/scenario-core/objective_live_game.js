
/*
this file will be what controls and keeps track of objectives within a scenario

Objectives will be defined as

Type, Location, Radius, Unit, Amount

if not needed just leave with "", unspecified amount for destroy enemy units in radius will be destroy all units there.


objective types(early):

- Build unit at location
- Move unit to location
- Control Location for x time
- Destroy enemy units at location
- Survive
- Build x
- Gather x resource
- Description/dialogue

*/

var objectivesToActivate =  ko.observable(-1).extend({ session: 'activeObjectives' });
var chosenLoadout =  ko.observable(-1).extend({ session: 'selectedLoadout' });

function removeByAttr(arr, attr, value){//courtesy of stack overflow but just what I needed
    var i = arr.length;
    while(i--){
       if( arr[i]
           && arr[i].hasOwnProperty(attr)
           && (arguments.length > 2 && arr[i][attr] === value ) ){

           arr.splice(i,1);

       }
    }
    return arr;
}

function ObjectiveViewModel() {

    var playerId = null;

    var self = this;

    self.allObjectives = ([]);

    self.activeObjectives = ([]);//an active objective may be hidden and should not show in ui if that is the case.

    self.finishedObjectives = ([]);

    self.scenarioComplete = (false); //if true display a ending message or trigger something??

}

var objectiveModel = new ObjectiveViewModel();

var totalObjectives = 0;
/*
This function takes in the objectives list and assigns them to all objectives and active objectives if they have a active at beginning tag.
*/

//checking for fnished scenario removed as it should be done via a trigger.

/*
This function takes in an objective and activates the appropriate function from objective_functions.js which will check and return progress. progress will be stored in the objective object.

many of the objective checking functions will be async so this is as well

returns true if objective is complete, returns progress if it is part of it. returns false is the objective is failed.
*/
function objectiveProgress(objectiveObject,playerId){

if(objectiveObject == "empty"){return null}

if(objectiveObject.activeEffect !== true && objectiveObject.effect !== undefined){

    var effectPuppetId = model.objectiveEffectFunctions[objectiveObject.effect](objectiveObject.location,objectiveObject.effectDuration);
    objectiveObject.activeEffect = true;
    objectiveObject.effectPuppetId = effectPuppetId;

}
if(objectiveObject.waveInterval!==undefined){
   
    
    api.Panel.message("players", 'scenarioWave',{timesCalled:objectiveObject.timesCalled, waveInterval:objectiveObject.waveInterval, elapsedTime: model.scenarioModel.RealTimeSinceLanding})
        
        
}

var returnPromise = new Promise(function(resolve,reject){resolve(model.objectiveCheckFunctions[objectiveObject.type](objectiveObject,playerId));})

returnPromise.then(function(result){//TODO replace the 0 with playerId
    //console.log("result of progress = "+result)
    if(objectiveObject.maxTime< model.scenarioModel.RealTimeSinceLanding && model.scenarioModel.RealTimeSinceLanding !== -200000 && objectiveObject.maxTime !== undefined){result = true}
    if(result == null){return}
    if(result === true){//move from active objectives into finished, update ui, activate success triggers
        if(objectiveObject.effectPuppetId !== undefined){

            objectiveObject.effectPuppetId.then(function(result){api.puppet.killPuppet(result)})
        }

        objectiveModel.finishedObjectives.push(objectiveObject)


        objectiveModel.activeObjectives = removeByAttr(objectiveModel.activeObjectives,"id",objectiveObject.id)

        for(var j = 0;j<objectiveObject.successTriggers.length;j++){

            model.activateTrigger(objectiveObject.successTriggers[j]);

        }
        for(var j = 0;j<objectiveObject.successObjectives.length;j++){


             console.log("making objective active: "+objectiveObject.successObjectives[j])
                model.makeObjectiveActiveByName(objectiveObject.successObjectives[j])



        }

    }
    else if(result === false){//move from active to finished, update ui, activate failure triggers.

        objectiveModel.finishedObjectives.push(objectiveObject)
        objectiveModel.activeObjectives = objectiveModel.activeObjectives.filter(function(item) {
            return item !== value
        })

    }
    else{//other result should be an update to progress, so update ui

        if(objectiveObject.timesCalled !== undefined){

            objectiveObject.timesCalled += 1;

        }
        if(objectiveObject.progress !== undefined){objectiveObject.progress = result;}
    }


    }).catch(function(err){console.log(err)})


}
/*

this needs it's own function due to the visual nature of some objectives.

e.g getting units in an area or king of the hill needs to show that area.

also triggers the needed ui components.

*/

function pushObjective(objeciveObject){

    objectiveModel.activeObjectives.push(objeciveObject)
}

model.makeObjectiveActive = function(objectiveObject){
    if(objectiveObject["delay_type"] == "spawn"){

        if(model.scenarioModel.landTime == 200000){_.delay(model.makeObjectiveActive,100,objectiveObject);return}
    }
    if(objectiveObject["delay"]>0){

        var delayMilliseconds = objectiveObject["delay"]*1000;
        console.log("activating objective with delay of "+ objectiveObject["delay"])

        if(objectiveObject["delay"] !== undefined || objectiveObject["delay"] == 0){

            _.delay(pushObjective,delayMilliseconds,objectiveObject); return}

        }
        else{
            console.log("activating objective")

            objectiveModel.activeObjectives.push(objectiveObject);
        }
}

model.makeObjectiveActiveByName = function(objectiveName){
    console.log(objectiveName)
    for(var i = 0;i<objectiveModel.allObjectives.length;i++){
        console.log(objectiveModel.allObjectives[i].name +" | "+objectiveName)
        if(objectiveModel.allObjectives[i].name === objectiveName){model.makeObjectiveActive(objectiveModel.allObjectives[i])}
    }



}

model.setupObjectives = function(inputObjectiveArray){
    console.log("objective setup started")
    var objectiveArray = inputObjectiveArray["objectives"]

    objectiveModel.playerId = 0;

    for(var i = 0;i<objectiveArray.length;i++){//converts shorthand values to easier to use ones

        if(objectiveArray[i].unitType !== undefined){objectiveArray[i].unitType = model.fullUnitName(objectiveArray[i].unitType)}

    }
    //hopefully none of this ends up being async


    if(objectivesToActivate() !== -1 && objectivesToActivate().length !== 0){
        for(var i = 0;i<objectiveArray.length;i++){


            objectiveModel.allObjectives[i] = objectiveArray[i];
            if(_.contains(objectivesToActivate(),objectiveArray[i].id) == true){

                model.makeObjectiveActive(objectiveArray[i])
            }

            totalObjectives++;
        }

    }
    else{
        for(var i = 0;i<objectiveArray.length;i++){


            objectiveModel.allObjectives[i] = objectiveArray[i];
            if(objectiveArray[i].startingObjective == true){

                model.makeObjectiveActive(objectiveArray[i])
            }

            totalObjectives++;
        }

    }

model.objectiveLoop();
}

model.objectiveLoop = function(){
    if(model.scenarioModel)
    if(model.scenarioModel == undefined){setTimeout(model.objectiveLoop,1000);return;
    }
    var avatarId = model.scenarioModel["avatarId"];

    if(avatarId == undefined || avatarId == -1){setTimeout(model.objectiveLoop,1000);return}
    objectiveModel.playerId = model.armyIndex()
    //console.log("objective loop running")


    //console.log(objectiveModel.playerId)
    if(objectiveModel){//if the model is defined
        var active = objectiveModel.activeObjectives;
        var activeObjectiveIds = []
        for(var i = 0;i<active.length;i++){

            activeObjectiveIds.push(active[i].id)
            objectiveProgress(active[i],objectiveModel.playerId)
            if(objectiveModel.activeObjectives[i].playerNames == undefined){objectiveModel.activeObjectives[i].playerNames = model.scenarioModel.playerNameArray}
            if(objectiveModel.activeObjectives[i].playerName == undefined){objectiveModel.activeObjectives[i].playerName = model.playerName()}

        }
        objectivesToActivate(activeObjectiveIds)
        //console.log("objective loop checked actives")


    }

    if(model.gameOver() !== true){

        //console.log("loop would be repeated here")
        setTimeout(model.objectiveLoop,1000);

    }
    api.Panel.message("players", 'objectiveUpdate' ,objectiveModel.activeObjectives)

}



// handlers.setupObjectives = function(payload) {

//     console.log("setup Objectives called with "+ payload)
//     objectiveModel.allObjectives = payload;

// };
