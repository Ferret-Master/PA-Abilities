//each function is an ability running

//ability ideas:
/**
 * - fireball: just an alt fire lol
 * - summon x: built/targeted that summons minions
 * - build turrets/defenses
 * - aoe health drain
 * - aoe healing
 * - global heal
 * - 
 */

//abilities will receive a base set of info and things like the heal/damage amount and aoe will be defined on a hero level

model.abilities = {
    "/pa/units/heroes/abilities/teleport/teleport.json":function(location, unitId){
        if(model.currentEnergy()>30){
            api.getWorldView(0).sendOrder({units: unitId,command: 'mass_teleport',location: {planet: planet,pos: location,orient: [0,0,0]},queue: false,group:true});
          
        }
    },
    "/pa/units/heroes/abilities/lightning_storm/lightning_storm.json":function(location){
        console.log("lightning storm attempted cast")
        if(model.currentEnergy()>40){
            model.spawnExact(model.armyIndex(),"/pa/units/heroes/abilities/lightning_storm/lightning_storm_unit.json", last_stand.planetId,location,[0,0,0])
            model.drainPower(40, location)
        }
    },
    "/pa/units/heroes/abilities/seeking_blast/seeking_blast.json":function(location){
        if(model.currentEnergy()>30){
            model.spawnExact(model.armyIndex(),"/pa/units/heroes/abilities/seeking_blast/seeking_blast_unit.json", last_stand.planetId,location,[0,0,0])
            model.drainPower(30, location)
        }
    },
    "/pa/units/heroes/abilities/smite/smite.json":function(location){
        if(model.currentEnergy()>30){
            model.spawnExact(model.armyIndex(),"/pa/units/heroes/abilities/smite/smite_unit.json", last_stand.planetId,location,[0,0,0])
            model.drainPower(30, location)
        }
    },
    "/pa/units/heroes/abilities/healing_aura/healing_aura.json":function(location){
        if(model.currentEnergy()>40){
            model.spawnExact(model.armyIndex(),"/pa/units/heroes/abilities/healing_aura/healing_aura_unit.json", last_stand.planetId,location,[0,0,0])
            model.drainPower(40, location)
        }
    },
    "/pa/units/heroes/abilities/summon_angel/summon_angel.json":function(location){
        if(model.currentEnergy()>99){
            model.spawnExact(model.armyIndex(),"/pa/units/heroes/paladin/angel/angel.json", last_stand.planetId,location,[0,0,0])
            model.drainPower(100, location)
        }
    },
    "/pa/units/heroes/abilities/ballista/ballista.json":function(location){
        if(model.currentEnergy()>40){
            model.spawnExact(model.armyIndex(),"/pa/units/heroes/abilities/ballista/ballista_unit.json", last_stand.planetId,location,[0,0,0])
            model.drainPower(40, location)
        }
    }
}

