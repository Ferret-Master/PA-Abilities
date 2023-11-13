//flubbs one did not fit my needs so writing my own

//will be replacing handlers.chat_message

//going to hardcode the 3 checks needed

//this is no longer present on modload so is re declared here
function ChatMessageModel(object) {
    var self = this;

    self.type = object.type ? object.type : "global";
    self.isGlobal = ko.computed(function () {
        return self.type === "global";
    });
    self.isTeam = ko.computed(function () {
        return self.type === "team";
    });
    self.isServer = ko.computed(function () {
        return self.type === "server";
    });

    self.message = object.message ? object.message : "";
    self.player_name = object.player_name ? object.player_name : "";

    if (self.isServer()) {
        self.message = loc(self.message, { 'player': self.player_name });
        self.player_name = "server";
    }

    self.time_stamp = new Date().getTime();
}



// 
handlers.chat_message = function (payload) {
    var chat_message = new ChatMessageModel(payload);
    var msg = chat_message.message
    if(msg.startsWith('BugStatus:')){
        msg = msg.replace('BugStatus:','');
        api.Panel.message(api.Panel.parentId, 'BugStatus',msg);
        return;
    }
    if(msg.startsWith('BugBuff:')){
        msg = msg.replace('NewDrawing:','');
        api.Panel.message(api.Panel.parentId, 'player_new_draw',msg);
        return
    }
    if(msg.startsWith('BugNerf:')){
        msg = msg.replace('EndDrawing:','');
        api.Panel.message(api.Panel.parentId, 'player_end_draw',msg);
        return;
    }
    if(msg.startsWith('BugUpgrade:')){
        msg = msg.replace('EndDrawing:','');
        api.Panel.message(api.Panel.parentId, 'player_end_draw',msg);
        return;
    }
    if(msg.startsWith('BugEvent:')){
        console.log("bug event in chat")
        msg = msg.replace('BugEvent:','');
        var chatJson = JSON.parse(msg);
        msg = "" + chatJson.name + ": " + chatJson.description;
        chat_message.player_name = "";
        api.Panel.message(api.Panel.parentId, 'bugEvent',chatJson);
    }
    if(msg.startsWith('NeutralEvent:')){
        msg = msg.replace('EndDrawing:','');
        api.Panel.message(api.Panel.parentId, 'player_end_draw',msg);
        return;
    }
    console.log(chat_message)
    chat_message.message = msg
    model.chatLog.push(chat_message);
    model.visibleChat.push(chat_message);
    $(".div_chat_feed").scrollTop($(".div_chat_feed")[0].scrollHeight);
    $(".div_chat_log_feed").scrollTop($(".div_chat_log_feed")[0].scrollHeight);

    //$()
};

var eventCSSMap = {
    "Spore Rain":{
        "color":"lime",
        "font-size": "20px",
        "font-weight": "bold"
    },
    "Solar Flare":{
        "color":"cyan",
        "font-size": "18px",
        "font-weight": "bold"
    }
}

ko.computed(function(){
    model.chatLog();
    _.delay(updateEventCSS,100)
})

function updateEventCSS(){
    _.forEach($(".chat_message_body"),function(span){
        var eventCSS = eventCSSMap[span.innerText.split(":")[0]];
        console.log(eventCSS)
        if(eventCSS !== undefined){
            var keys = _.keys(eventCSS);
            for(var i = 0; i < keys.length; i++){
                span.style[keys[i]] = eventCSS[keys[i]]
            }
        }
    })
}

model.flashChat = function(element){

}

model.playSound = function(soundPath){

}