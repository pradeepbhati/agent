(function (angular){
	"use strict;"

	angular.module('bargain').factory('ChatServerService', ['$resource', function ($resource) {

		var ChatServerService;
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
		var chatServerLogin = $resource(Globals.AppConfig.ChatServerConnect, {}, {
		  query: {
		    method:'POST', 
		    isArray: false, 
		    params:{}, 
		    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
		    transformRequest: manageReqPacketTransform
		  }
		});

	    var fetchUserHistory = function(token,contact, pageNo){
		    return $resource(Globals.AppConfig.GetUserHistory+pageNo, {mobile:contact}, {
			query: {
	                    method: 'GET',
	                    headers: {
				'Authorization': token
	                    }
			}
	            });
		};

		var getConsumerMessagingInfo = function(token,mobile){
			return $resource(Globals.AppConfig.GetConsumerMessagingInfo, {mobile:mobile}, {
				query: {
					method: 'GET',
					headers: {
				    		'Authorization': token
					}
				}
			});
		};

	    var downloadMedia = function(token, multimediaId){
		return $resource(Globals.AppConfig.DownloadMedia, {multimediaId:multimediaId} ,{
		    query: {
			method: 'GET',
			headers: {
			    'Authorization': token
			}
		    }
		});
	    };
	    
		// var fetchUserHistory = $resource(Globals.AppConfig.GetUserHistory, {}, {
		//   query: {
		//     method:'POST',
		//     isArray: false, 
		//     params:{}, 
		//     headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
		//     transformRequest: manageReqPacketTransform
		//   }
		// });

		ChatServerService = {
      		    login: chatServerLogin,
      		    fetchUserHistory: fetchUserHistory,
		    downloadMedia: downloadMedia,
		    getConsumerMessagingInfo: getConsumerMessagingInfo
      		};

		return ChatServerService;
	}]);
})(angular);
