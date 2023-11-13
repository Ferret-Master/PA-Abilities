//all trigger types will be stored within a trigger api file. makes it easy to use.

function TriggerViewModel() {

    var self = this;

    self.allTriggers = ([]);//used to pre assemble api needed at start of match rather than every time.

    self.allTriggernames = ([]);//names for reference in other functions.

    //self.nonObjectiveTriggers = ([]);//tese are uneeded as a timed objective accomplishes the same thing neater


}

var scenarioTriggerModel = new TriggerViewModel();

model.setupTriggers = function(triggerArray){
    console.log("trigger setup started")
    console.log(triggerArray)
    if(scenarioTriggerModel){
    for(var i = 0;i<triggerArray.length;i++){

        scenarioTriggerModel.allTriggers[i] = triggerArray[i];
        scenarioTriggerModel.allTriggernames[i] = triggerArray[i].name;
    }
    }
}

model.activateTrigger = function(triggerName){ //this prevents creators breaking things by calling triggers with no defined values.
    console.log("activate trigger called with value "+triggerName)
    console.log(scenarioTriggerModel["allTriggernames"])
    var playerIndex = model.armyIndex()
    for(var i = 0;i<scenarioTriggerModel["allTriggernames"].length;i++){
        if(scenarioTriggerModel.allTriggernames[i] == triggerName){
            var triggerObject = scenarioTriggerModel.allTriggers[i];
            if(triggerObject.playerIndex !== undefined){
                console.log("checking if player index matches")
                console.log(triggerObject.playerIndex,playerIndex)
                if(triggerObject.playerIndex !== playerIndex){return}
                console.log("matched index")
            
            }
            var delayMilliseconds = triggerObject["delay"]*1000;
            var delay_type = triggerObject["delay_type"] 
            if(delay_type == "spawn" && model.scenarioModel.landTime == 200000){_.delay(model.activateTrigger,100,triggerObject.name); return}
            console.log(delay_type)
            console.log(model.scenarioModel.landTime)
            console.log("commander landed so running trigger")
            if(triggerObject.delay !== undefined || triggerObject.delay == 0){_.delay(model.triggerFunctions[triggerObject.type],delayMilliseconds,triggerObject); return}
           console.log("running the trigger")
           console.log(triggerObject.type)
            model.triggerFunctions[triggerObject.type](triggerObject)
        }
    }
    return "no trigger of that name was defined"

}

// handlers.setupTriggers = function(payload) {
//     console.log("setup triggers called with "+ payload)
//     triggerModel.allTriggers = payload;
    
// };

// handlers.activateTrigger = function(payload) {
//     console.log("activating trigger "+ payload)
//     triggerModel.allTriggers = payload;
    
// };