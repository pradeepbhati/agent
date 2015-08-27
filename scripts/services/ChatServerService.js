(function(angular) {
	"use strict;"

	angular.module('bargain').factory('ChatServerService', ['$resource', 'Upload', '$http', function($resource, Upload, $http) {

		var ChatServerService;
		var manageReqPacketTransform = function(Obj) {
			var str = [];
			for (var p in Obj) {
				if (typeof(Obj[p]) == "object") {
					str.push(encodeURIComponent(p) + "=" + JSON.stringify(Obj[p]));
				} else {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(Obj[p]));
				}
			}
			return str.join("&");
		};
		var chatServerLogin = $resource(Globals.AppConfig.ChatServerConnect, {}, {
			query: {
				method: 'POST',
				isArray: false,
				params: {},
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				transformRequest: manageReqPacketTransform
			}
		});

		var fetchUserHistory = function(token, contact, pageNo) {
			return $resource(Globals.AppConfig.GetUserHistory + pageNo, {
				mobile: contact
			}, {
				query: {
					method: 'GET',
					headers: {
						'Authorization': token
					}
				}
			});
		};

		var getConsumerMessagingInfo = function(token, mobile) {
			return $resource(Globals.AppConfig.GetConsumerMessagingInfo, {
				mobile: mobile
			}, {
				query: {
					method: 'GET',
					headers: {
						'Authorization': token
					}
				}
			});
		};

		var uploadMedia = function(token, mid, file) {
			return Upload.upload({
				url: Globals.AppConfig.UploadMedia,
				file: file,
				fields: {
					'mid': mid
				},
				headers: {
					'Authorization': token
				},
				fileFormDataName: 'multimedia',
				sendFieldsAs: "form"

			});
		};

		var pushFoodMenu = function(mid, receiver) {
			console.log("inside food menu factory code");
			var date = new Date();
			date = date.toISOString().split('T')[0];
			var cookie = getCookie('agentKey');
			cookie = cookie.split('"').join('');
			var params = {
				"mid": mid,
				"sent_to": receiver,
				"form_class": "food-form",
				"date": date
			}

			var req = {
			 	method: 'POST',
			 	url: Globals.AppConfig.GenerateFoodForm,
			 	headers: {
			   	'Authorization': cookie
			 	},
			 	data: params
			};
			return $http(req);
		};

		var downloadMedia = function(token, multimediaId) {
			return $resource(Globals.AppConfig.DownloadMedia, {
				multimediaId: multimediaId
			}, {
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

		function getCookie(sKey) {
	    if (!sKey) { return null; }
	    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
		};

		ChatServerService = {
			login: chatServerLogin,
			fetchUserHistory: fetchUserHistory,
			uploadMedia: uploadMedia,
			downloadMedia: downloadMedia,
			pushFoodMenu: pushFoodMenu,
			getConsumerMessagingInfo: getConsumerMessagingInfo
		};

		return ChatServerService;
	}]);
})(angular);