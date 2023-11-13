

model.jsonMessageHandlers = {}
model.registerJsonMessageHandler = function(identifier, handler, priority){
    if (!identifier || !handler) {
        return false;
    }
    var registeredJsonMessageHandlers = model.jsonMessageHandlers[identifier];

    if (!registeredJsonMessageHandlers) {
        registeredJsonMessageHandlers = [];
        model.jsonMessageHandlers[identifier] = registeredJsonMessageHandlers;
    }

    registeredJsonMessageHandlers.push({ handler: handler, priority: priority || 100});

    return true;
}





var client_state_scenario = handlers.client_state; handlers.client_state = function (client) {
            
    client_state_scenario(client);

    var playerCom = "/pa/units/commanders/imperial_able/imperial_able.json"
    if (client.landing_position) {
        var players = model.players()
        for(var i = 0; i<players.length;i++){
            
            if(players[i].stateToPlayer == "self"){
                color = players[i].primary_color
             
                playerCom = players[i].commanders[0]
            }

        }
        
    
      
        
        client.landing_position.color = color;
        var landingObject ={
        
            "planet": client.landing_position.planet_index,
            "pos":[
                client.landing_position.location.x,
                client.landing_position.location.y,
                client.landing_position.location.z
            ],
            
            "playerCom": playerCom
        }


        api.Panel.message(api.Panel.pageId, 'ScenarioLandingPosition',landingObject)
       
    }

};

var commanderid = undefined;

var server_state_scenario = handlers.server_state; handlers.server_state = function(msg) { 

server_state_scenario(msg);

if (msg.data) {
    
switch (msg.state) {
    case 'landing':

        if (msg.data.client && msg.data.client.zones) {
            var zones = msg.data.client.zones;
            api.Panel.message(api.Panel.pageId, 'ScenarioLandingZones',zones)
           
        }

        
        break;



}

}



}


var scenarioHandler = function(msg)
{
    console.log(msg)
    var data = msg.payload;

    if (!data)
        return;

        switch (data.type)
        {
// host is sending scenario to players
        case 'spawnEffect':
            console.log("spawning Effect from other player")
            console.log(data.jsonObject)
            if (data.jsonObjejct !== "")
            {
                api.puppet.createEffect(data.jsonObject.effectName,data.jsonObject.location,data.jsonObject.duration,true);
            }

            break;
            
        }
}

model.registerJsonMessageHandler("scenarios", scenarioHandler );

handlers.json_message = function (jsonMsg) {
    api.debug.log(JSON.stringify(jsonMsg));
           var payload = jsonMsg.payload;
           if (!payload) {
               return;
           }
           var identifier = payload.identifier;
           if (!identifier) {
               return;
           }
           var handlers = model.jsonMessageHandlers[identifier];
           if (handlers) {
               try {
                   _.forEach(handlers, function(handlerObj) {
                       var handler = handlerObj.handler;
                       if (_.isFunction(handler)) {
                           handler(jsonMsg);
                       }
                   });
               }
               catch (e) {
                   console.trace(e);
               }
           }
       };