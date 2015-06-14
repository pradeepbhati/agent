(function (angular){
        "use strict;"

        angular.module('bargain').factory('ConsumerDataService', ['$resource', function ($resource) {

		var ConsumerDataService;
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
	
		var getConsumerProfile = function(token, mobile){
			return $resource(Globals.AppConfig.GetConsumerData, {mobile:mobile}, {
                  		query: {
                    			method:'GET',
                    			isArray: false,
                    			params:{},
					headers: {
                         	   		'Authorization': token
                        		},
                    			transformRequest: manageReqPacketTransform
                  		}
                	});
		};

		ConsumerDataService = {
			getConsumerProfile: getConsumerProfile
		};

		return ConsumerDataService;

        }]);
})(angular);
