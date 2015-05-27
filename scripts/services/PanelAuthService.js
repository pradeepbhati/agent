(function (angular){
	"use strict;"

	angular.module('bargain').factory('PanelAuthService', ['$resource', function ($resource) {

		var PanelAuthService;
		var manageReqPacketTransform = function(Obj) {
		    var str = [];
		    for(var p in Obj){
		      if(typeof(Obj[p]) == "object"){
		          str.push(encodeURIComponent(p) + "=" + JSON.stringify(Obj[p]));
		      } else {
		          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(Obj[p]));
		      }
		    }
		    return str.join("&");
		};

		var agentPanelLogin = $resource(Globals.AppConfig.PanelLoginUrl, {}, {
		  query: {
		    method:'POST', 
		    isArray: false, 
		    params:{}, 
		    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
		    transformRequest: manageReqPacketTransform
		  }
		});

		var agentPanelLogout = $resource(Globals.AppConfig.PanelLogoutUrl, {}, {
		  query: {
		    method:'POST', 
		    isArray: false, 
		    params:{}, 
		    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
		    transformRequest: manageReqPacketTransform
		  }
		});

		var chatServerCredentials = function(token){
			return $resource(Globals.AppConfig.AgentChatCredentials, null, {
	            query: {
	                method: 'GET',
	                headers: {
	                    'Authorization': token
	                }
	            }
	        })
		};

		PanelAuthService = {
      		agentPanelLogin: agentPanelLogin,
      		agentPanelLogout : agentPanelLogout,
      		chatServerCredentials : chatServerCredentials
      	}

		return PanelAuthService;
	}]);
})(angular);