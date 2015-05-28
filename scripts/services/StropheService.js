(function (angular){
	"use strict;"

	angular.module('bargain').factory('StropheService', ['$rootScope', 'ChatCoreService', function ($rootScope, ChatCoreService) {

		var StropheService;
		var connection = function(login, password) {
			var connect = new Strophe.Connection(Globals.AppConfig.StropheConnect);
			connect.connect(login, password, function (status) {
				console.log("StropheService Status : " + status);
				$rootScope.$emit("StropheStatusChange", status, connect);
			})
		};
		var disconnect = function(connection){
			connection.disconnect('Loging out');
		};

		var connectionStatus = function(status){
			var statusMesg = "";
			switch(status.toString()){
				case "0" :
					statusMesg = "An error has occurred";
					break;
				case "1" :
					statusMesg = "Connecting to Chat Server ..";
					break;
				case "2" :
					statusMesg = "The connection attempt failed";
					break;
				case "3" :
					statusMesg = "The connection is authenticating";
					break;
				case "4" :
					statusMesg = "The authentication attempt failed";
					break;
				case "5" :
					statusMesg = "Connected to Chat Server : "; //+ user.email;
					break;
				case "6" :
					statusMesg = "The connection has been terminated";
					break;
				case "7" :
					statusMesg = "The connection is currently being terminated";
					break;
				case "8" :
					statusMesg = "The connection has been attached";
					break;

			}
			return statusMesg;
		};
		StropheService = {
      		connection: connection,
      		disconnect : disconnect,
      		connectionStatus : connectionStatus 
      	}
		return StropheService;
	}]);
})(angular);
