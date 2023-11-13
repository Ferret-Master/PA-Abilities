/*
this function takes in the scenario json and spkits it up/starts up the other functions that need to run

Currently each scenario file contains 3 major areas. 

- The scenario settings, these will be passed to scenario live game after the other 2 are passed on. These will be checked and stop a scenario starting if incorrect settings are set.

- The objective settings, these will be passed into objectives_live_game.

- The trigger settings, these will be passed into triggers_live_game.

*/


var chosenScenario =  ko.observable(-1).extend({ session: 'selectedScenario' });

function loadScenario(location){//will be made into an api/observable later , will be loaded by command for testing, followed by checking for system load.
    if(location == ""){return}
    model.unitKeys = _.keys(model.unitSpecs)

    $.getJSON('coui:/mods/scenarios/' + location+'.json').then(function(imported) {
        
       try{
        model.setupTriggers(imported["triggers"]);
        model.setupScenario(imported);
        model.setupObjectives(imported);
    }
    catch(err){console.log(err)}

    });

    
   
};
function loadTestScenario(){console.log("no scenario loaded")}
//  setTimeout(loadTestScenario,100)

if(chosenScenario().length <2 || chosenScenario() == undefined || chosenScenario() == -1){loadTestScenario()}

else{_.delay(loadScenario,100,chosenScenario())}

function loadBasetest(){
    loadScenario("bug_standard_base")
}