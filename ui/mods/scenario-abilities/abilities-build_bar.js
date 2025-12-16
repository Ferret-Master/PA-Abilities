
//shadowing execute start build to intercept ability usage and inform backend about it

//identify abilities by checking if id starts with abilities

var activeBuildId = ko.computed(function(){

    api.Panel.message(api.Panel.parentId,'activeBuildId',model.activeBuildId())
  
    return model.activeBuildId()

})