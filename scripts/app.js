(function (angular){
"use strict;"
	var app = angular.module('bargain', ['ngRoute', 'ngResource', 'LocalStorageModule', 'ui.bootstrap']);
	
	// app.config(['$routeProvider',  '$locationProvider', function($routeProvider, $locationProvider){
	// 	$routeProvider
	// 		.when('/',{
	// 			templateUrl:'partials/login.html',
	// 			controller : ''
	// 		})
	// 		.when('/chat',{
	// 			templateUrl:'partials/overallView.html',
	// 			controller : ''
	// 		})
	// 		.when('/chatview',{
	// 			templateUrl:'partials/chatview.html',
	// 			controller : ''
	// 		})
	// 		.when('/test',{
	// 			templateUrl:'partials/test.html',
	// 			controller : ''
	// 		})
	// 		.otherwise({
	// 			redirectTo: '/'
	// 		});

	// 		$locationProvider.html5Mode({
 //                 enabled: true,
 //                 requireBase: false
 //        	});
	// }])
	// .run(['datepickerPopupConfig', function(datepickerPopupConfig) {
	//     datepickerPopupConfig.appendToBody = true;
	//     datepickerPopupConfig.showButtonBar = false;

	// }]);


	app.config(['$httpProvider', function($httpProvider){
	  $httpProvider.defaults.useXDomain = true;
	}]);

	app.config(['$resourceProvider', function($resourceProvider){
	  $resourceProvider.defaults.stripTrailingSlashes = false;
	}]);

	app.config(['localStorageServiceProvider', function(localStorageServiceProvider){
	  localStorageServiceProvider.setPrefix('bargain');
	}]);
})(angular);
