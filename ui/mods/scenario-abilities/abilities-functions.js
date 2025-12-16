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


