/**
 * string.padStart pollyfill from https://github.com/behnammodi/polyfill/blob/master/string.polyfill.js
 * Can be removed once Coherent UI is updated, like, at all.
 */
if (!String.prototype.padStart) {
    Object.defineProperty(String.prototype, "padStart", {
        configurable: true,
        writable: true,
        value: function (targetLength, padString) {
            targetLength = targetLength >> 0; // floor if number or convert non-number to 0;
            padString = String(typeof padString !== "undefined" ? padString : " ");
            if (this.length > targetLength) {
                return String(this);
            } else {
                targetLength = targetLength - this.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength / padString.length); // append to original to ensure we are longer than needed
                }
                return padString.slice(0, targetLength) + String(this);
            }
        },
    });
}

/**
 * Convert seconds to an hh:mm:ss time, where hours are only shown if time is >= 1h
 */
function secondsToTime(seconds) {
    var h = Math.floor(seconds / 3600),
        m = Math.floor(seconds % 3600 / 60),
        s = Math.floor(seconds % 60);

    h = h ? (h.toString() + ":") : ""; // Only show hours if needed, and don't pad
    m = m.toString().padStart(2, "0") + ":";
    s = s.toString().padStart(2, "0");

    return h + m + s;
}

/**
 * Convert a `progress` or `needed` value from a number into a fancy string
 */
function formatObjectiveValue(value, format) {
  var output = format;

  if (format === "") {
    return value > 1000 ? Math.round(value / 100) / 10 + "K" : value;
  }

  if (format === "h") {
    return Math.floor(value / 3600) + "m";
  }

  if (format === "m") {
    return Math.floor(value % 3600 / 60) + "m";
  }

  if (format === "s") {
    return Math.floor(value % 60) + "s";
  }

  if (_.includes(format, "mm")) {
    output = output.replace("mm", Math.floor(value % 3600 / 60).toString().padStart(2, "0"));
  }

  if (_.includes(format, "ss")) {
    output = output.replace("ss", Math.floor(value % 60).toString().padStart(2, "0"));
  }
model.objectiveDescriptions =[];
model.objectiveProgresses = [];
model.objectiveNeeded = [];
model.objectiveResults = [];
model.testValue = ko.observable(0);
model.waveTime = null;

  return output;
}

var toggleImage = function(open) {
    return open ? 'coui://ui/main/shared/img/controls/pin_open.png' : 'coui://ui/main/shared/img/controls/pin_closed.png';
};

model.alreadyMadeFrame = ko.observable(true);
model.hideScenarioPanel = ko.observable(false);
model.toggleHideScenarioPanel = function () { model.hideScenarioPanel(!model.hideScenarioPanel()); };
model.scenarioPanelToggleImage = ko.computed(function() { return toggleImage(!model.hideScenarioPanel()); });

handlers.objectiveUpdate = function(payload) {
    payload.forEach(function(objective, i) {
        if (!objective.visible) {
            $("#objectivesList li:nth-child(" + (i + 1) + ")").hide();
            return;
        }

        $("#objectivesList li:nth-child(" + (i + 1) + ")").show();

        if (objective.description !== undefined) {
            $("#objectivesList li:nth-child(" + (i + 1) + ") .objective_description").text(objective.description);
        }

        if (objective.progress !== undefined) {
            // Currently disabled as no scenarios use the "king" syntax, and this probably doesn't work / is outdated
            // if (objective.syntax === "king") {
            //     var finalString = "";
            //     var topPlayerString = "";
            //     var highestNum = 0;
            //     var playerName = payload[i].playerName;
            //     var playerNumber = 0;
            //
            //     for(var j = 0; j < array[i].length; j++){
            //         if (array[i][j] > highestNum) {
            //           highestNum = array[i][j]; topPlayerString = payload[0].playerNames[j]
            //         }
            //
            //         if (playerName === payload[0].playerNames[j]) {
            //           playerNumber = array[i][j];
            //         }
            //     }
            //
            //     finalString += (playerName + ":" + playerNumber + "\r\n" + "Leader:" + topPlayerString + " with " + highestNum);
            //
            //     $(".progress" + visibleObjectiveIndex).html(finalString);
            // } else {

            var percentComplete = 100 / objective.needed * objective.progress;

            var text = (objective.syntax === "%")
              ? Math.floor(percentComplete) + "%"
              : formatObjectiveValue(objective.progress,  objective.syntax.split("/")[0]);

            $("#objectivesList li:nth-child(" + (i + 1) + ") .objective_progress__current").text(text);

            var progressBar = $("#objectivesList li:nth-child(" + (i + 1) + ") .objective_progress_bar");

            progressBar.toggleClass('objective_progress_bar--flash', percentComplete >  90);
            progressBar.children(":first").width(percentComplete + "%");
        }

        if (_.includes(objective.syntax, "/")) {
            $("#objectivesList li:nth-child(" + (i + 1) + ") .objective_progress__syntax").text("/");
        }

        if (objective.needed !== undefined && objective.syntax !== "%") {
            var text = formatObjectiveValue(objective.needed, objective.syntax.split("/")[1]);
            $("#objectivesList li:nth-child(" + (i + 1) + ") .objective_progress__needed").text(text);
        }

        if (objective.result !== undefined) {
            $("#objectivesList li:nth-child(" + (i + 1) + ") .objective_result").text(objective.result);
        }
    });
};

handlers.scenarioDetails = function(payload) {
    $("#scenarioAuthor").html(payload[0]);
    $("#scenarioName").html(payload[1] + " by ");
}

//updates the ingame clock on the scenario ui
handlers.scenarioTime = function(payload) {
    $("#landingTime").text(secondsToTime(payload));
    var displayedMinutesSinceLanding = Math.floor(payload/60)
    var displayedSecondsSinceLanding = Math.round(payload%60);
    if(displayedSecondsSinceLanding < 10){displayedSecondsSinceLanding =  "0"+displayedSecondsSinceLanding}
   
    $(".landingTime").html(displayedMinutesSinceLanding+":"+displayedSecondsSinceLanding)
}

// handlers.scenarioWave = function(payload) {
    
//     if (model.waveTime === undefined || model.waveTime > payload.waveInterval) {
//         model.waveTime = payload.waveInterval;
//     }

//     if (model.waveTime < payload.waveInterval) {
//         model.waveTime = payload.waveInterval;
//         //return;
//     }

//     $("#waveTime").text(secondsToTime(payload.waveInterval - Math.round(payload.elapsedTime % payload.waveInterval)));
// }

$.get("coui://ui/mods/scenario-ui/objective_ui_live_game.html", function (html) {
    var $html = $(html);
    $html.insertAfter("script + svg");

    // Activates knockout.js
    ko.applyBindings(model, $html[0]);
});
      
    var initialTimesCalled = undefined;
    handlers.scenarioWave = function(payload) {
        if(initialTimesCalled == undefined){initialTimesCalled = payload.timesCalled}
        var wavesSkipped = (Math.floor(initialTimesCalled/payload.waveInterval))
        if(wavesSkipped < 0){wavesSkipped *= -1}
        if(payload.timesCalled > 0){wavesSkipped = 0}
        else{payload.waveInterval = (payload.waveInterval*wavesSkipped + payload.waveInterval)}
        var displayedSecondsSinceLanding = payload.waveInterval - Math.round(payload.elapsedTime%payload.waveInterval);
       console.log(displayedSecondsSinceLanding)
        //if(payload.timesCalled < 0){displayedSecondsSinceLanding += payload.waveInterval - Math.round(payload.waveInterval);}
      
        if(displayedSecondsSinceLanding < 10){displayedSecondsSinceLanding =  "0"+displayedSecondsSinceLanding}
        $("#waveTime").text(displayedSecondsSinceLanding)
       
        
    }


    displayBanner = function(text,size, color, sound){
    
    }