//Only purpose is to relay time data to live_game
function SendScenarioTime(){
	var CurrentTime = model.currentTimeInSeconds()
	//console.log("current time in time bar is "+CurrentTime)

	api.Panel.message(api.Panel.parentId, 'ScenarioTime',CurrentTime)
	setTimeout(SendScenarioTime, 1000);
	return
	}
(function () {
    

    //update every second

    setTimeout(SendScenarioTime, 1000);


})();
