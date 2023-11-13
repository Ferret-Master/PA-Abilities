var model;
var handlers = {};

$(document).ready(function () {
    
    function DevModeViewModel() {
        var self = this;

        self.state = ko.observable({});
        self.cheatAllowChangeVision = ko.computed(function() { return !!self.state().cheatVision; });
        self.cheatAllowChangeControl = ko.computed(function() { return !!self.state().cheatControl; });
        self.players = ko.computed(function() { return self.state().players || []; });
        self.playerVisionFlags = ko.computed(function() { return self.state().vision || []; });
        self.playerControlFlags = ko.computed(function() { return self.state().control || []; });

        self.updatePlayerVisionFlag = function (index) {

            if (!self.cheatAllowChangeVision())
                return;

            var newFlags = self.playerVisionFlags().slice(0);
            newFlags[index] = !newFlags[index];

            // Tell the server
            self.send_message('change_vision_flags', { 'vision_flags': newFlags });
            
            // Tell the parent panel
            api.Panel.message(api.Panel.parentId, 'panel.invoke', ['playerVisionFlags', newFlags]);
        };
       
        self.updatePlayerControlFlag = function (index) {
            if (!self.cheatAllowChangeControl())
                return;
            
            var newControlFlags = _.times(self.players().length, _.constant(false));
            newControlFlags[index] = true;
            
            
            
            var clientControlFlags = _.map(newControlFlags, function(flag) { return flag ? 1 : 0; });
          
            
            //console.log(clientControlFlags)
           

            // Tell the server
            self.send_message('change_control_flags', { 'control_flags': newControlFlags });
           


            // Tell the parent panel
            api.Panel.message(api.Panel.parentId, 'panel.invoke', ['playerControlFlags', newControlFlags]);
     
        };
        self.spawnAvatarOld = function (index) {
            var currentPlayerIndex = undefined;
            var avatarName = "/pa/units/commanders/scenario_avatar/scenario_avatar.json";
            for(var i = 0;i<this.playerControlFlags().length;i++){
        
                if(this.playerControlFlags()[i] == true){currentPlayerIndex = i;}
        
            }
            if(index == currentPlayerIndex){
               
                engine.call('unit.debug.setScenarioSpecId',avatarName);
                engine.call('unit.debug.scenarioPaste')
                return;
            }
            this.updatePlayerControlFlag(index);
           
            
        
            engine.call('unit.debug.setSpecId',avatarName);
            setTimeout(function(){ engine.call('unit.debug.paste')}, 50);
        
            setTimeout(this.updatePlayerControlFlag.bind(null, currentPlayerIndex), 100);
            //this.updatePlayerControlFlag(currentPlayerIndex);
        
        };

        self.spawnAvatar = function(){//using as other version had multiplayer issues and want that work

            var avatarName = "/pa/units/commanders/scenario_avatar/scenario_avatar.json";
            engine.call('unit.debug.setScenarioSpecId',avatarName);
            engine.call('unit.debug.setSpecId',avatarName)
 
            setTimeout(function(){ engine.call('unit.debug.scenarioPaste')}, 100);
            setTimeout(function(){ engine.call('unit.debug.paste')}, 100);
            return;

        }
        self.spawnUnit = function(unit){//using as other version had multiplayer issues and want that work

            var avatarName = unit;
            engine.call('unit.debug.setScenarioSpecId',avatarName);
            engine.call('unit.debug.scenarioPaste')

            engine.call('unit.debug.setSpecId',avatarName);
            setTimeout(function(){ engine.call('unit.debug.paste')}, 50);
            return;

        }
        self.tempControlSwitch = function (index,time) {
            var currentPlayerIndex = undefined;
            for(var i = 0;i<this.playerControlFlags().length;i++){
        
                if(this.playerControlFlags()[i] == true){currentPlayerIndex = i;}
        
            }
            
            this.updatePlayerControlFlag(index);
          
            setTimeout(this.updatePlayerControlFlag.bind(null, currentPlayerIndex), time+50);
           
            
        
        };

        self.active = ko.observable(true);
        
        self.setup = function () {
            $(window).focus(function() { self.active(true); });
            $(window).blur(function() { self.active(false); });
            
            api.Panel.query(api.Panel.parentId, 'panel.invoke', ['devModeState']).then(self.state);
        };
    }
    model = new DevModeViewModel();
    
    handlers.state = function (payload) {
        model.state(payload);
   
    };

    //test command = api.Panel.message("devmode","switchControl",1);
    handlers.switchControl = function(settings){

        if(settings[1] == undefined){settings[1] = 500}

        model.tempControlSwitch(settings[0],settings[1])

    }
    handlers.spawnAvatar = function(playerIndex,time){

        if(time == undefined){time = 500}

        model.spawnAvatar()

    }
    handlers.spawnUnit = function(unit){

        

        model.spawnUnit(unit)

    }
    // inject per scene mods
    if (scene_mod_list['live_game_devmode'])
        loadMods(scene_mod_list['live_game_devmode']);

    // setup send/recv messages and signals
    app.registerWithCoherent(model, handlers);

    // Activates knockout.js
    ko.applyBindings(model);

    // run start up logic
    model.setup();
});
