(function (angular){
	"use strict;"

	angular.module('bargain').factory('TemplateService', ['$resource', function ($resource) {

		var TemplateService;
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
		var getMessageTemplates = $resource(Globals.AppConfig.MessageTemplates, {}, {
		  query: {
		    method:'POST', 
		    isArray: false, 
		    params:{}, 
		    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
		    transformRequest: manageReqPacketTransform
		  }
		});

		TemplateService = {
      		getMessageTemplates: getMessageTemplates
      	}

		return TemplateService;
	}]);
})(angular);