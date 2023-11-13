

function getRndInteger(min, max) {
    return (Math.random() * (max - min + 1) ) + min;
  }
function init_unit_control(api) {
    api.unit_control = {
        doCommand:function(Planet, id, command, playerIndex,template,location, targetId){ 
        
        /*in the case of scenarios this is single unit, 
        will seperpate multiple units prior to calling this if needed. 

        templates will be provided in format outlined in the build_template api

        this function will only be passing them on. It will accept array

        //test command = api.unit_control.doCommand(0,66,'startbuild')


        */
        var switchPlayer = false;
        if(playerIndex !== "" && playerIndex !== undefined){switchPlayer = true}
        switch (command){
        
        
        case 'assist': //temp old implementation
        
                        api.getWorldView(0).sendOrder({units: id,command: 'assist',location: {planet: Planet,entity: targetId},queue: true,group:true});
                        
                break	
        
        case 'buildproxy':
            
            
            //console.log("tried to build proxy")
            
            
           
                    
                    var proxySpots = randomLocations(20,500);
                    var proxyDist = 10000;
                    var proxySpot;
                    
                    //console.log(proxySpots)
                    
                    for(var y = 0;y<proxySpots.length;y++){
                        

                        if(distanceBetween(proxySpots[y],unitData[i].pos,500)<proxyDist && distanceBetween(proxySpots[y],unitData[i].pos,500)){
                            
                            proxyDist = distanceBetween(proxySpots[y],unitData[i].pos,500);
                            //console.log(proxyDist)
                            proxySpot = proxySpots[y];
                            //console.log(proxySpot)
                            
                            
                        }
                        
                        //console.log("finished loop "+y)
                        
                    }
                
                    
                    var t1_vehicle = [['/pa/units/land/laser_defense/laser_defense.json',[0,0,0]],['/pa/units/land/land_barrier/land_barrier.json',[-6.9298095703125, -6.464599609375, -2.638946533203125]],['/pa/units/land/land_barrier/land_barrier.json',[-5.4591064453125, 6.540489196777344, -5.082427978515625]],['/pa/units/land/land_barrier/land_barrier.json',[4.62322998046875, -7.453849792480469, 4.421478271484375]],['/pa/units/land/land_barrier/land_barrier.json',[6.697723388671875, 6.994163513183594, 2.067962646484375]],['/pa/units/land/vehicle_factory/vehicle_factory.json',[57.194366455078125, -1.2824325561523438, 29.0701904296875]],['/pa/units/land/air_defense/air_defense.json',[37.00370788574219, 36.513099670410156, 9.11236572265625]],['/pa/units/land/energy_plant/energy_plant.json',[57.435272216796875, 31.039939880371094, 20.454071044921875]],['/pa/units/land/energy_plant/energy_plant.json',[49.730316162109375, 46.18822479248047, 11.9075927734375]],['/pa/units/land/energy_plant/energy_plant.json',[42.27333068847656, 61.14745330810547, 2.82598876953125]],['/pa/units/land/radar/radar.json',[26.945831298828125, 17.42285919189453, 9.98992919921875]],['/pa/units/land/artillery_short/artillery_short.json',[13.843963623046875, 43.413658142089844, -5.311676025390625]]];
                    Build_Location = proxySpot;
                    buildPreFab(t1_vehicle,Build_Location,Planet,world,id);
                        
                    
            	
                break;	
        
        
        case 'buildPreFab':
        
            //console.log("startbuild ran");
          
                        
                        var prefab1 = [['/pa/units/land/bot_factory/bot_factory.json',[-2.0239028930664062, -36.8651123046875, -17.118804931640625]]];
                        
                        
                        var prefab2 = [['/pa/units/land/energy_plant/energy_plant.json',[22.974594116210938, -2.4946441650390625, -3.134185791015625]],['/pa/units/air/air_factory/air_factory.json',[-31.1947021484375, 6.299530029296875, 8.32269287109375]],['/pa/units/land/energy_plant/energy_plant.json',[-30.78289794921875, -19.900314331054688, -5.199554443359375]],['/pa/units/land/energy_plant/energy_plant.json',[-31.125396728515625, -35.41386413574219, -12.120849609375]],['/pa/units/land/vehicle_factory/vehicle_factory.json',[-60.22503662109375, -48.797943115234375, -11.629852294921875]],['/pa/units/land/energy_plant/energy_plant.json',[-62.40160369873047, -13.116363525390625, 5.3621826171875]],['/pa/units/land/energy_plant/energy_plant.json',[-61.77001190185547, 3.795318603515625, 14.040863037109375]],['/pa/units/land/vehicle_factory/vehicle_factory.json',[-99.6378173828125, 3.006622314453125, 25.5037841796875]],['/pa/units/land/energy_plant/energy_plant.json',[-91.46755981445312, -31.091567993164062, 5.04095458984375]],['/pa/units/land/energy_plant/energy_plant.json',[-109.58995056152344, -32.72755432128906, 10.565216064453125]]];
                        
                        
                        Build_Location = [getRndInteger(-300,300),getRndInteger(-300,300),getRndInteger(-300,300)];
                        
                        if(switchPlayer == true){
                            
                        api.Panel.message("devmode","switchControl",playerIndex);

                        var tempFunc = function(prefab1,Build_Location,Planet,id){api.build_preset.buildPreFab(prefab1,Build_Location,Planet,id);}
                        setTimeout(tempFunc.bind(null,prefab1,Build_Location,Planet,id),50);
                        setTimeout(tempFunc.bind(null,prefab2,Build_Location,Planet,id),50);
                        // api.build_preset.buildPreFab(prefab1,Build_Location,Planet,id);
                        
                        // api.build_preset.buildPreFab(prefab2,Build_Location,Planet,id);		
                        	
                        }
                        else{
                            
                        api.build_preset.buildPreFab(prefab1,Build_Location,Planet,id);
                        
                        api.build_preset.buildPreFab(prefab2,Build_Location,Planet,id);	
                        

                        }
                        
            
                break;					
            
        }
    }
	}
};
init_unit_control(window.api);