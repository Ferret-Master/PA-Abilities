//to prevent players from calling sandbox commands I am using the same method that puppetmaster did, may be uneeded due to also being in live game, makes it slightly harder to debug spawn things.

if (window.location.href != 'coui://ui/main/game/live_game/live_game.html') {
  (function() {
    var originalCall = engine.call
    engine.call = function(method) {

      if (method == 'unit.debug.setSpecId') {
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
  })}

  //I think the above is uneeded as I call this in live game already and this may have not been working for whatever reason.