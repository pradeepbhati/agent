(function(angular){
	"use strict";
	angular.module('bargain').controller('loginCtrl', ['$scope', '$rootScope','$location' ,
		function($scope, $rootScope, $location){

		function validateLogin(){
			var isValid = true;
			$scope.usernameError = $scope.passwordError = "";
			if(!$scope.username){ $scope.usernameError  =  "Please enter your email"}
			if(!$scope.password){ $scope.passwordError  =  "Please enter password"}
			if($scope.usernameError || $scope.passwordError){
				isValid = false;
			}
			return isValid;
		};

		// function aunthenticateUSer(){
		// 	var isValid = validateLogin();
		// 	if(validateLogin()){
		// 		if($scope.username && $scope.password){
		// 			if(($scope.username.trim() !== "pradeep@104.131.98.86" && $scope.password.trim() !== "pradeep") 
		// 			|| ($scope.username !== "pradeep1@104.131.98.86" && $scope.password !== "pradeep1")){
		// 				$scope.usernameError =" Please enter valid username and Pwd";
		// 			}
		// 		}
		// 		if($scope.usernameError){
		// 			isValid = false;
		// 		}
		// 	}
		// 	return isValid;
		// }

		$scope.logIn  = function(){
			if(validateLogin()){
				 var user = {
				 	name : $scope.username + '@' + Globals.AppConfig.ChatHostURI,
				 	password: $scope.password
				 }
				 $rootScope.user = user;
				 $rootScope.isLogin = $scope.isLogin = true;
				 $rootScope.$broadcast('chatConnet')
			}
		};
	}])
})(angular)
