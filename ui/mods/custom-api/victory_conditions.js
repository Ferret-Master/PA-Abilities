
//intended usage will be the main function calling this to initiate certain victory conditions
//calling KingOfTheHill with the hill location/radius will start certain checks and update knockout variables
//it will also initilise the ui setup needed
//this will only be triggered at the start of a match

function init_victory_conditions(api) {
    api.unit_control = {

        KingOfTheHill: function(Planet,Location,Radius){





        },
        Stockpile: function(goalEnergy,goalMetal,goalUnitBool,goalUnit){





        },
        BuildUnit: function(unitType){//not sure how to distinguish partially built and complete atm.





        },
        KillUnit: function(unitId){





        },






    }
}
init_victory_conditions(window.api);