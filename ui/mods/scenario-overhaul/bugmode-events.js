//contains logic to perform events that are not just number changes

model.eventSoundsPaths = {
    sporeRain:""
}
//defines event functions, properties etc
model.eventProperties = {
    solarFlare: {
        solarFlare: function(){
            console.log("running solar flare event")
        },
        chatProperties:{
            eventName:"solarFlare",
            name:"Solar Flare",
            description:"A solar flare causes widespread power loss",
            sound:"soundName",
            event:true
        }
    },
    sporeRain: {
        sporeRain: function(){
            console.log("running spore rain event")
        },
        chatProperties:{
            eventName:"sporeRain",
            name:"Spore Rain",
            description:"A rain of bug spores spreads far and wide",
            sound:"soundName",
            event:true
        }
    }
}


model.triggerBugEvent = function(eventName){
    model.eventProperties[eventName][eventName]();
   
}

model.sendOutBugEvent = function(eventName){
    model.send_message("chat_message", {message: ("BugEvent:"+ JSON.stringify( model.eventProperties[eventName].chatProperties))});
}

handlers.bugEvent = function(payload){
   
    model.triggerBugEvent(payload.eventName)
}