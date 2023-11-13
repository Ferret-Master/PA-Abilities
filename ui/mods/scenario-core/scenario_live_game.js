



    var originalCall = engine.call
   model.cheatAllowCreateUnit(false)//set to false to prevent bulk create units from working by default
    engine.call = function(method) {

      if (method == 'unit.debug.copy') {
        console.log("not allowed for player")
        return undefined;
      }

      if (method == 'unit.debug.paste') {
        console.log("not allowed for player")
        return undefined;
      } else if (method == 'unit.debug.setScenarioSpecId') {
        method = 'unit.debug.setSpecId';
        return originalCall.apply(this, arguments);
      }
        else if (method == 'unit.debug.scenarioPaste') {
            method = 'unit.debug.paste';
            return originalCall.apply(this, arguments);

      } else {
        return originalCall.apply(this, arguments);
      }
    }




/*
so far this will probably be used mainly for verifying the scenario so it does not run with incorrect lobby/ game setups.

will probably add some flags so that only the lobby host can issue the cheat commands. That way everyone gets ui but people don't double up on commands, mainly an issue for shared.


this triggers the necessary api for setting up certain scenario's as well.

any scenario that requires building will have this spawn in avatar fabs at the start

also keeps track of things, as it is not appropriate for objectives or triggers to do so.



*/

var chosenLoadout =  ko.observable(-1).extend({ session: 'selectedLoadout' });

function ScenarioViewModel() {

    var self = this;

    self.avatarId  = -1;

    self.playerNameArray = []; //contains the player names matches in order with the id's for reference, mostly for the ui.

    self.playerArray = []; //contains the player id for everyone in lobby, stored here so other code can use this as a stable reference

    self.aiArray = ([])//would contain an object for each ai with things like armyindex, avatarid

    self.scenarioComplete = (false); //if true display a ending message or trigger something??

    self.landTime = 200000;

    self.RealTimeSinceLanding = -200000;

    self.fullTime = 0;

    self.author = "author";

    self.scenarioName = "scenario name";

    self.replacementCom = "/pa/units/commanders/scenario_invincible_com/scenario_invincible_com.json"

    self.playerSpawn = {//this need to be made array compatible for shared

      zones: undefined,

      chosenPos:undefined,

      chosenPlanet: undefined,

      chosenOrientation: undefined


    }

    self.playerCommanderType =  ko.observable(-1).extend({ session: 'selectedCommanderSpec' })();

    self.playerCommanderId = undefined;

    self.noSelection = ["/pa/units/commanders/scenario_avatar/scenario_avatar.json","/pa/units/air/scenario_loader/scenario_loader.json"];

    self.planetLength =0;
}
model.scenarioModel = new ScenarioViewModel();

  var selectionChecker = ko.computed(function(){
  var noSelect = model.scenarioModel.noSelection;
  var unwantedId = [];
  if(model.selection() == undefined || model.selection() == null){return}
  var selectionId = model.selection().spec_ids;

  for(var i = 0;i<noSelect.length;i++){

    if(selectionId[noSelect[i]] !== undefined){

      for(var j = 0;j<selectionId[noSelect[i]].length;j++){
        unwantedId.push(selectionId[noSelect[i]][j])
      }

    }

  }

  var wantedId = [];

  var selectedKeys = _.keys(selectionId)

  for(var i = 0;i<selectedKeys.length;i++)
  {

    for(var j = 0;j<selectionId[selectedKeys[i]].length;j++){
      wantedId.push(selectionId[selectedKeys[i]][j])
    }
  }

  oldWantedId = wantedId;

  wantedId = _.difference(wantedId,unwantedId)

  if(oldWantedId.length <= wantedId.length){return oldWantedId}

  api.select.unitsById(wantedId);



})

function getAvatarId(){ // gets the id's for each avatar

    model.scenarioModel.avatarId = []
    var avatarPromiseArray = []
    for(var i = 0;i<model.scenarioModel.planetLength;i++){

      var avatarPromise = model.playerArmy(model.armyIndex(),i,"/pa/units/commanders/scenario_avatar/scenario_avatar.json")
      avatarPromiseArray.push(avatarPromise)

    }
    avatarPromise = Promise.all(avatarPromiseArray)


    avatarPromise.then(function(result){

      try{
        var validAvatar = false;
        for(var resultIndex in result){

          if(result[resultIndex]["/pa/units/commanders/scenario_avatar/scenario_avatar.json"] == undefined || _.isEmpty(result[resultIndex]["/pa/units/commanders/scenario_avatar/scenario_avatar.json"])){continue}
          validAvatar = true

           model.scenarioModel.avatarId[resultIndex] = result[resultIndex]["/pa/units/commanders/scenario_avatar/scenario_avatar.json"]
        }
        if(validAvatar == false){_.delay(getAvatarId,1000);return}

    }
      catch(err){console.log(err)}

    var playerAmount = model.playerListState().players.length;
    for(var i = 0;i<playerAmount;i++){
      model.scenarioModel.playerArray.push(i)
      model.scenarioModel.playerNameArray.push(model.players()[i].name)
    }


    })
}

function getCommanderId(){

  commanderPromise = model.allPlayerArmy(model.armyIndex(),"",false,"UNITTYPE_Commander");
  commanderPromise.then(function(result){
    console.log(result)
    if(result == undefined || _.isEmpty(result)){_.delay(getCommanderId,1000);return}
    model.scenarioModel.playerCommanderId = [];
    for(var property in result){
      for(commanderIndex in result[property]){
        model.scenarioModel.playerCommanderId.push(result[property][commanderIndex])

      }

    }


  })
}

var cursor_x = -1;
var cursor_y = -1;
document.onmousemove = function(event)
{

cursor_x = event.pageX;
cursor_y = event.pageY;
}

model.setupScenario = function(scenarioJSON){ // sets up necessary components for the scenario
  //if(model.isSpectator() == true){return}
    var planets = model.planetListState()
    console.log("setting up scenario")

    if(planets == undefined || planets.planets.length<1){_.delay(model.setupScenario,100,scenarioJSON);return}
    planets = planets.planets
    model.scenarioModel.planetLength = planets.length

    if(scenarioJSON["requireBuilders"] == true){

            for(var planetIndex in planets){
              var planet = planets[planetIndex]
              console.log(planet)
              if(planet.id !== undefined){//check it is not the sun
                console.log("spawning avatar on planet "+planetIndex)
                var armyId = model.armyIndex()
                if(armyId == undefined || armyId == -1){_.delay(model.setupScenario,100,scenarioJSON);return}
                model.spawnExact(armyId,"/pa/units/commanders/scenario_avatar/scenario_avatar.json", planetIndex, [0,0,planet.radius],[0,0,0])

              }

            }



            setTimeout(getAvatarId,500)
            setTimeout(getCommanderId,2000)

    }
    else{

      setTimeout(getCommanderId,2000)
      model.scenarioModel.avatarId = -2

    }
    if(scenarioJSON.loadout !== undefined){
      model.applyLoadout();
    }
    model.scenarioModel.author = scenarioJSON["author"]
    model.scenarioModel.scenarioName = scenarioJSON["name"]
return;
}


handlers.ScenarioTime = function(payload) {

    if(model.scenarioModel !== undefined){

    model.scenarioModel.fullTime = Math.round(payload);
    if((model.scenarioModel.playerCommanderId !== undefined || model.hasSelection()) && model.gameOver() == false && model.maxEnergy() > 0){

        if( model.scenarioModel.fullTime<model.scenarioModel.landTime &&  model.scenarioModel.fullTime !== 0){model.scenarioModel.landTime =  model.scenarioModel.fullTime}

    }
    if(model.scenarioModel.landTime !== 200000){
       if(model.scenarioModel.playerSpawn.chosenPos == undefined){model.getCommanderData()}
        var realTime = model.scenarioModel.fullTime - model.scenarioModel.landTime;
        model.scenarioModel.RealTimeSinceLanding = realTime;
        api.Panel.message("players", 'scenarioTime',realTime)
        api.Panel.message("players", 'scenarioDetails',[model.scenarioModel["author"],model.scenarioModel["scenarioName"]])

    }}


};

handlers.ScenarioLandingZones = function(payload) {

  model.scenarioModel.playerSpawn.zones = payload;

}

handlers.ScenarioLandingPosition = function(payload) {

  if(model.scenarioModel.playerCommanderType == -1){model.scenarioModel.playerCommanderType = payload.playerCom;}

  //model.playerArmy(model.armyIndex(),payload.planet,payload.playerCom,false).then(function(result){model.scenarioModel.playerCommanderId = result[payload.playerCom]; console.log("player commander id is " + result)})


}


model.applyLoadout = function(){
  if(chosenLoadout !== "None" && chosenLoadout !== undefined){
    $.getJSON('coui:/mods/loadouts/' + chosenLoadout() + '.json').then(function(importedloadout) {
    var replacementArrays = importedloadout.replace;
    var unitsToLock = importedloadout.locked;
    var startingUnits = importedloadout.units;
    api.Panel.message("build_bar", 'replaceUnit',replacementArrays)
    for(var i = 0;i<unitsToLock.length;i++){
      api.Panel.message("build_bar", 'lockUnit',unitsToLock[i])
    }
    })
  }
  if(chosenLoadout == "assault_loadout"){//trigger custom behaviour for the assault loadout
    //adds custom visible objective to active objectives that spawns rewards at a given unit type every time the metal destroyed reaches a certain amount.
    // each existing reward structure also passivley gains the player income to spawn these waves

    var assaultObjective = {
      rewardStructure1:[],
      rewardStructure2:[],
      amountNeededPerReward:4000,
      structure1Passive:0,
      structure2Passive:0,
    }
    model.makeObjectiveActive(assaultObjective)
  }
}
