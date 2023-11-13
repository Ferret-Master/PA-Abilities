/*

After dealing with the issues dynamic placement with fixup causes I have decided to switch to hardcoded values per planet. 

I can keep fixup for single structures and working around the issue is possible but not worth the time currently.

The new way it will work is the preset values in the json will specify the planet, location and orientation.

A seperate part of the json file will have triggers that can specify things like "prior to spawn, after spawn, after x objective"

Objective_Triggers: {


Spawn_Trigger: {

    Event: spawn,
    Triggered_Events: [] //would include build triggers


}
BuildTriggers : [{
    TriggerTime: null,
    PreFabName: "spawnbase",

}]

}
the above will be inside an objective triggers object.


will be re writing this function when I do the format

*/



function init_build_preset(api) {
    api.build_preset = {
    buildCommand: function(id,planet,structure){//keeping build command seperate from spawn unit for now as some buildings need to abuse the fact you can build in the air
                          
        //console.log("attempting build command with unitid: " + id + " planet: "+planet + " spec: "+ structure+" at location "+ structure.pos);
        console.log(api.getWorldView(0).sendOrder({units: unitid,command: 'build',location: {planet: planet,multi_pos: [location,location]},spec: spec,queue: true}));
       
        //api.getWorldView(0).sendOrder({units: id,command: 'build',location: {planet: planet,multi_pos: [structure.pos,structure.pos],orient: structure.orientation},spec: structure.unitType,queue: true,group:true});
        console.log(api.getWorldView(0).sendOrder({units: id,command: 'build',location: {planet: planet,multi_pos: [structure.pos,structure.pos],orient: structure.orientation},spec: structure.unitType,queue: true,group:true
    
    
    }))},

    buildCommandUnit: function(id,planet,structure){
        //structure.orientation = [structure.orientation[0],structure.orientation[1],structure.orientation[2]]                  
        
        // console.log(api.getWorldView(0).sendOrder({units: unitid,command: 'build',location: {planet: planet,multi_pos: [location,location]},spec: spec,queue: true}));
        model.spawnExact(model.armyIndex(),structure.unitType,planet,structure.pos,structure.orientation)
        //api.getWorldView(0).sendOrder({units: id,command: 'build',location: {planet: planet,pos: structure.pos,orient: structure.orientation},spec: structure.unitType,queue: true,group:true});
        //console.log(api.getWorldView(0).sendOrder({units: id,command: 'build',location: {planet: planet,multi_pos: [structure.pos,structure.pos],orient: structure.orientation},spec: structure.unitType,queue: true,group:true
    
    
    },
    buildCommandOld: function(unitid,planet,spec,location){
                        
        //console.log("attempting build command with unitid: " + unitid + " planet: "+planet + " spec: "+ spec+" at location "+ location[0]);
        // console.log(api.getWorldView(0).sendOrder({units: unitid,command: 'build',location: {planet: planet,multi_pos: [location,location]},spec: spec,queue: true}));
        api.getWorldView(0).sendOrder({units: unitid,command: 'build',location: {planet: planet,multi_pos: [location[0],location[0]],orient: location[1]},spec: spec,queue: true,group:true});
    
        },
    fixup: function(prefab,world,planet,build_location,id){//heavily modified fixup to accept and return full build orders
        
        /*e.g [['laser_turret',[0,1,2]],[laser_turret,[2,4,5]]] as a prefab format, 0,0,0 is effectivly the given build location


        above is old build template

        I will be switching to jsons for ease of use

        I will have the option for dynamic vs static placement within the templates which will determine whether they are build at
        the exact location specified(a static template that was made on the map) or dynamic meaning the template will be fixed up to ensure
        it gets built. although the spacing may end up off.
 
        */


        var fixupPromiseArray = [];
        for(var structure = 0; structure<prefab.length;structure++){
            
            var spec = prefab[structure][0];
        
            var structureOffset = prefab[structure][1];
            
            var structureLocation = [build_location[0]+structureOffset[0],build_location[1]+structureOffset[1],build_location[2]+structureOffset[2]]; //applies prefab offsets to build location to get actual location
        
            
            structureLocation = [{pos:structureLocation}];
            
            var fixedloc = engine.call('worldview.fixupBuildLocations', world.id, String(spec), Number(planet), JSON.stringify(structureLocation)).then(function(raw) {return [JSON.parse(raw)];});
            
            
            
            fixupPromiseArray[structure] = fixedloc;
        }
        
        var fixupPromise = Promise.all(fixupPromiseArray);
   
        
    

        fixupPromise.then(function(ready) {
                                     
                                            
                                            
            var postfix = ready;
           // console.log("postfix: "+JSON.stringify(postfix))
            //var spec = postfix[0]; unused?
        
            for(var building = 0;building<prefab.length;building++){
                                            
                var Blocation = [postfix[building][0][0].pos,postfix[building][0][0].orient];
                var specname = prefab[building][0];
                
               
                api.build_preset.buildCommand(id,planet,specname,Blocation);
                
            }
                                        

                                            
            }).catch(function (err) {
                console.log("Promise Rejected");
                console.log(err);
            });
        
    },

    buildPreFab: function(prefab,build_Location,planet,id){ //queues the build commands for the prefab

        
        var preFabPromise = function(prefabPart,world,planet,build_Location,id){this.fixup(prefabPart,world,planet,build_Location,id)}


        var world = {id:0};
       // splitting pre fab here is worth a shot
        for(var i = 0;i<prefab.length;i++){

            var prefabPart = [prefab[i]]
            
            
            setTimeout(this.fixup.bind(null,prefabPart,world,planet,build_Location,id),i*100);

            
        }
        // this.fixup(prefab,world,planet,build_Location,id).then(function(ready) {
                                     
                                            
                                            
        //     var postfix = ready;
        //     console.log("postfix: "+JSON.stringify(postfix))
        //     var spec = postfix[0];
        
        //     for(var building = 0;building<prefab.length;building++){
                                            
        //         var Blocation = postfix[building][0][0].pos;
        //         var specname = prefab[building][0];
                
               
        //         api.build_preset.buildCommand(id,planet,specname,Blocation);
                
        //     }
                                        

                                            
        //     }).catch(function (err) {
        //         console.log("Promise Rejected");
        //         console.log(err);
        //     });

            },


    exactPreFab: function (preFab){//takes in prefab object that defines everything needed
            var id = preFab[0]
            var prefab = preFab[1];
            var planet = prefab.planet;
            var unitArray = prefab.units;
            for(var i = 0; i<unitArray.length;i++){
                
                var structure = unitArray[i];
                
                api.build_preset.buildCommand(id,planet,structure);
                
            }                                     

    },
    exactPreFabUnit: function (preFab){//takes in prefab object that defines everything needed, unit edition
        var id = preFab[0]
        var prefab = preFab[1];
        var planet = prefab.planet;
        var unitArray = prefab.units;
        for(var i = 0; i<unitArray.length;i++){
            
            var structure = unitArray[i];
            
            api.build_preset.buildCommandUnit(id,planet,structure);
            
        }                                     

}
        }
};
init_build_preset(window.api);


/**
 * wondibles code for bulk paste, if this works fine it is actually way better tha half the stuff I was trying earlier, wasted a lot of time
 * 
 * define([
], function(
) {
  var pasteUnitLocations = function(locations, army_id) {
    var configure = function(fixups) {
      return fixups.map(function(loc, i) {
        //console.log(loc.ok, loc.desc, loc.pos, loc.orient)
        return {
          army: army_id,
          what: loc.spec_id,
          planet: loc.planet,
          location: loc.pos,
          orientation: loc.orient,
        }
      })
    }

    createUnits3D(configure(locations))
  }

  var createUnits3D = function(drops) {
    if (!model.cheatAllowCreateUnit()) return

    drops.forEach(function(drop) {
      model.send_message('create_unit', drop)
    })
  }

  return {
    pasteUnitLocations: pasteUnitLocations,
  }
})
 */
model.spawnExact = function(army,spec,planet,location,orientation){
    
    var createJson = {

        army: model.players()[army].id,
          what: spec,
          planet: planet,
          location: location,
          orientation: orientation
    }
    model.send_message('create_unit', createJson)

}