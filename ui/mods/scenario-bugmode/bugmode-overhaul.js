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
function controllerMissing(){//if assumed controller has not sent out update in x time set yourself to controller if your uptime is highest

}

function assignController(){

}

function updateController(){//each player messages relevant info in chat that controller adds to game state, will loop every few seconds

}

function updatePlayers(){//controller sends out a json copy of the current gamestate that each player then adopts to update ui/behaviour, will loop fairly often

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

function expansionController(){}

function waveController(){}

function mainLoop(){
    if(controllerMissing){
        
    }
}