(function (angular){
    "use strict;"

    angular.module('bargain').factory('WizRocketService', ['$resource', function($resource) {

	var isEnabled = true;
	
	var WizRocketService;
	
	var sendEvent = function(eventName,eventData){
	    if(!isEnabled){
		return;
	    }
	    wizrocket.event.push(eventName,eventData);
	};

	WizRocketService = {
	    sendEvent: sendEvent
	};

	return WizRocketService;
	
    }]);
})(angular);
