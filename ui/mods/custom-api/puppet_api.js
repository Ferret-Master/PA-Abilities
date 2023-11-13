
//taken from contextual pings, will need re write

//for effects just needs another function that doesn't need the model, will include effects in this api.
function init_puppet_control(api) {
api.puppet = {
createPuppet: function(puppetName, location,animation,effectsType,color,pingDuration){ //takes in name of unit in file, and contextual info then generates the rest of create puppet
		

	
	color.push(0.99)
		puppetName+=".json";
		var chosenUnit;
		var config = [{}];
		unitKeys = _.keys(model.unitSpecs);
		for(var i = 0;i<unitKeys.length;i++){
			
			if(unitKeys[i].endsWith(puppetName)){
				chosenUnit = unitKeys[i];
			}
		}
		if(!chosenUnit.length>1){return}
		$.getJSON("coui://"+chosenUnit).then(function(data){
			
			unitJSON = data;
			console.log(effectsType)
			if(effectsType != undefined){config[0].fx_offsets =  
				
					{
					  "type": "energy",
					  "filename": "/pa/effects/scenario_specs/"+effectsType+".pfx",
					  "offset": [
						0,
						0,
						0
					  ],
					  "orientation": [
						0,
						0,
						0
					  ]
					}
				  
			}
			config[0].model = unitJSON.model;
			if(Array.isArray(config[0].model)){
				config[0].model = config[0].model[0]
			}
			if(animation.length>1){config[0].animate = {"anim_name":animation};}
			config[0].location = location;
			config[0].material = { 
			"shader":"pa_unit_ghost",
			"constants":{
			   "GhostColor":color ,
			   "BuildInfo":[
				  0,
				  0,
				  0,
				  0
			   ]
			},
			"textures":{
			   "Diffuse":"/pa/effects/textures/diffuse.papa"
			}}
		
			api.getWorldView(0).puppet(config, true).then((function(result){
				
				setTimeout(function() { killPuppet(result[0].id); }, pingDuration*1000);
				return result[0].id;
			}));
		
		
	});
},
createEffect: function(effectName, location,duration, snap){
			console.log(effectName,location,duration,snap)
			if(snap == true){location.snap = true}
			if(duration == undefined || duration == 0){duration = 21600}//set to 6 hours if unspecified
			var config = [{}];
			config[0].fx_offsets =  
				
					{
					  "type": "energy",
					  "filename": "/pa/effects/scenario_specs/"+effectName+".pfx",
					  "offset": [
						0,
						0,
						-2
					  ],
					  "orientation": [
						0,
						0,
						0
					  ]
					}
				  
			
			
		
			config[0].location = location;
			config[0].material = { //unsure if needed for just effect
			"shader":"pa_unit_ghost",
			"constants":{
			   "GhostColor":[0,0,0,0] ,
			   "BuildInfo":[
				  0,
				  0,
				  0,
				  0
			   ]
			},
			"textures":{
			   "Diffuse":"/pa/effects/textures/diffuse.papa"
			}}
		
			return api.getWorldView(0).puppet(config, true).then((function(result){
				setTimeout(function() { api.puppet.killPuppet(result[0].id); }, duration*1000);
				return result[0].id;
			}));



},

	killPuppet:function (puppetid){
		console.log("attempting to kill puppet "+puppetid)
	api.getWorldView(0).unPuppet(puppetid);
},

createEffectVanilla: function(effectName, location,duration, snap){
	console.log(effectName,location,duration,snap)
	if(snap == true){location.snap = true}
	if(duration == undefined || duration == 0){duration = 21600}//set to 6 hours if unspecified
	var config = [{}];
	config[0].fx_offsets =  
		
			{
			  "type": "energy",
			  "filename": effectName,
			  "offset": [
				0,
				0,
				-2
			  ],
			  "orientation": [
				0,
				0,
				0
			  ]
			}
		  
	
	

	config[0].location = location;
	config[0].material = { //unsure if needed for just effect
	"shader":"pa_unit_ghost",
	"constants":{
	   "GhostColor":[0,0,0,0] ,
	   "BuildInfo":[
		  0,
		  0,
		  0,
		  0
	   ]
	},
	"textures":{
	   "Diffuse":"/pa/effects/textures/diffuse.papa"
	}}

	return api.getWorldView(0).puppet(config, true).then((function(result){
		setTimeout(function() { api.puppet.killPuppet(result[0].id); }, duration*1000);
		return result[0].id;
	}));



},

killPuppet:function (puppetid){
console.log("attempting to kill puppet "+puppetid)
api.getWorldView(0).unPuppet(puppetid);
},
// var mutePings = false; may need to be re added

	



playAudio: function(filename){
	api.audio.playSoundFromFile(filename);
},
killAllPuppets:function(){
	
	
	if(model.maxEnergy() > 0){
		
		api.getWorldView(0).clearPuppets();
		return;
	}
	else{setTimeout(killAllPuppets, 1000);
	return;}
	
	
	}

};
}
init_puppet_control(window.api);