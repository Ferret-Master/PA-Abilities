//overhaul uses hive mode as a base but requires different internals so will be seperate file wise
var bugStatus = {
    landTime:null,
    bugUnlocks:[],
    bugBuffs:[],
    neutralEvents:[],//this would be a list of objects, as each event will have a name/location
    playerController:0

}

var playerUptime = []//tracks each players uptime and uses this to assign controller status, goes uptime then slot if even uptime
//for central control can either make it regular update based or detect disconnects

function updateController(){//each player messages relevant info in chat that controller adds to game state, will loop every few seconds
    
}

function updatePlayers(controllerId, statusObject){//controller sends out a json copy of the current gamestate that each player then adopts to update ui/behaviour, will loop fairly often
    statusJson.playerController = controllerId;
    statusObject.sendingPlayer = model.armyIndex();
    model.send_message("chat_message", {message: ("BugStatus:"+JSON.stringify(statusJson))});
}


function sendCommandToPlayers(){//director events need to be communicated to players to trigger puppets/ui stuff

}


function playerDirector(){//controls rewards for struggling players/over time. time/metal loss based

}

function aggressionBehavior(){//based on the bugs aggression value it tweaks values used for expansion/wave spawning

}

function aiDirector(){//based on time/destroyed bug structures, will cause both events and upgrades/buffs for the bugs


}

function neutralDirector(){//performs events that are not directly related to bugs. usually at the start of the game for variety

}

function expansionController(){//manages bug base expansion/buildings, adaptive to what is needed and aggression values

}

function waveController(){//manages bug waves and army composition, will adjust over time and adapt to some things + buffs and nerfs

}



var timeSinceControllerMessage = 0;
model.overhaulMainLoop = function(){
    
    var controllerMissingTime = timeSinceControllerMessage-5;
    if(controllerMissingTime > model.armyIndex()){ //checks and assigns controller if missing
        updatePlayers(model.armyIndex(), bugStatus)
    }
    //all player logic
    updateController();

    //end player logic
    if(bugStatus.playerController !== model.armyIndex()){
        _.delay(model.overhaulMainLoop, 1000);
        return
    }
    //controller logic below
    playerDirector();
    aggressionBehavior();
    aiDirector();
    neutralDirector();
    expansionController();
    waveController();
    updatePlayers(model.armyIndex(), bugStatus)
    _.delay(model.overhaulMainLoop, 1000)
}



//status is only sent out by controller, if there is no status sent for x seconds(5ish) then the controller is switched to the next number u[p
//every player will increment this at the same time until one of them is running the scenario, that player then sends the most up to date status
handlers.BugStatus = function(statusObject){
    if(statusObject.controller == statusObject.sendingPlayer){
        timeSinceControllerMessage = 0;
        statusObject.sendingPlayer = undefined;
        bugStatus = statusObject.bugStatus
    }
}