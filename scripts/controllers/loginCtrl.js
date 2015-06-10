(function(angular){
	"use strict";
	angular.module('bargain').controller('loginCtrl', ['$scope', '$rootScope','$location', 'PanelAuthService', 'MessageService', '$cookieStore',
		function($scope, $rootScope, $location, PanelAuthService, MessageService, $cookieStore){

		function validateLogin(){
			var isValid = true;
			$scope.usernameError = $scope.passwordError = "";
			if(!$scope.username){ $scope.usernameError  =  "Please enter your username"}
			if(!$scope.password){ $scope.passwordError  =  "Please enter password"}
			if($scope.usernameError || $scope.passwordError){
				isValid = false;
			}
			return isValid;
		};

		$scope.checkLogin = function(){
			console.log($cookieStore);
			var agentSessionKey = $cookieStore.get('agentKey');
			if(!agentSessionKey){
				$rootScope.isLogin = $scope.isLogin = false;
			}
			else {
				// TODO validate session later.
				var user = {
					token : agentSessionKey
				}
				$rootScope.user = user;
				$rootScope.isLogin = $scope.isLogin = true;
				$rootScope.$broadcast('chatConnet');
			}
		}
		$scope.checkLogin();

		$scope.loginToPanel = function(){
			PanelAuthService.agentPanelLogin.query({
				username : $scope.username,
				password : $scope.password
			}, function success(response){
				if(response.key){
					var user = {
				 		name : $scope.username,
				 		password: $scope.password,
				 		token: response.key
				 	}
					$cookieStore.put('agentKey',user.token);
				 	$rootScope.user = user;
				 	$rootScope.isLogin = $scope.isLogin = true;
				 	$rootScope.$broadcast('chatConnet');
				}
				else{
					MessageService.displayError("Some error occured while logging in. Please ");
				}
			}, function failure(error){
				if(error.status === 400){
					if(error.data && error.data.username){
						$scope.usernameError = error.data.username[0];
					}
					else if(error.data && error.data.password){
						$scope.passwordError  = error.data.password[0];
					}
				}
			})
		};

		$scope.logIn  = function(){
			if(validateLogin()){
				$scope.loginToPanel();
			}
		};
	}])
})(angular)
