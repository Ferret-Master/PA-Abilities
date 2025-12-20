//functions used in many abilities/backend stuff




model.drainPower = function(power, location){
    for(var i = 0; i< power;i+=10){
        model.spawnExact(model.armyIndex(),"/pa/units/land/power_drain/power_drain_10.json", last_stand.planetId,location,[0,0,0])
    }
}

model.drainMetal = function(metal){

}

model.drainHealth = function(health, unitId){

}


/**    audio:"/pa/audio/success.wav",
        image:"coui://ui/mods/scenario-ui/ui-assets/reward_background.png",
        text:"you have received a reward of "+chosenRewardType+" units!",
        duration:5
*/
model.displayNotification = function(audio,image,text,duration){
        var rewardNotification = {
        audio:audio,
        image:image,
        text:text,
        duration:duration
    }
    api.Panel.message("LiveGame_FloatZone", 'notification', rewardNotification)
}