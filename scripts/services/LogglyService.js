(function (angular){
    "use strict;"

    angular.module('bargain').factory('LogglyService', ['$resource', function($resource) {

	var isEnabled = true;

	var LogglyService;

	var sendLog = function(logData){
	    if(!isEnabled){
		return;
	    }
	    _LTracker.push(logData);
	    LE.log(logData);
	};

	LogglyService = {
	    sendLog: sendLog
	};

	return LogglyService;

    }]);
})(angular);
