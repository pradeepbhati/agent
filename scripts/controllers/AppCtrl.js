(function (angular){
	"use strict;"
	angular.module('bargain')
		.controller('AppCtrl', ['$scope', '$rootScope', 'ChatServerService', 'StropheService', 'ChatCoreService', 'PanelAuthService', 'MessageService', 'TemplateService','UtilService', 'IntimationService', '$timeout',
			function ($scope, $rootScope, ChatServerService, StropheService, ChatCoreService, PanelAuthService, MessageService, TemplateService, UtilService, IntimationService, $timeout) {

				$scope.init =function(){
					// $rootScope.bargainAgent = user;
					$rootScope.chatSDK = ChatCoreService.chatSDK;
					$rootScope.plustxtId = null;
					$rootScope.sessionid = null;
					$rootScope.tigoId = null;
					$rootScope.resourceId = null;
					$rootScope.plustxtcacheobj = {};
					$rootScope.plustxtcacheobj.contact = {};
					$rootScope.plustxtcacheobj.message = {};
					$rootScope.plustxtcacheobj.products = {};
					$rootScope.flashMessage = "";
					$rootScope.password = null;
					$rootScope.usersCount = 0;
					$rootScope.logoutRequestRaised = null;
				};

				$scope.logout = function(){
					try  {
						if(!$rootScope.logoutRequestRaised){
							IntimationService.agentLogoutRequest.query({
								session_id : $rootScope.sessionid
							}, function success(response){
								if(response.message == "success" && response.status === 0){
									$rootScope.$broadcast("Agent-Logout-Request");
								}
							}, function failure(error){
								MessageService.displayError("Logout request could not be made.");
							})
						}
						else{
							$rootScope.$broadcast("Agent-Logout-Request");
						}
					}
					catch(e){
						$scope.forceLogout("Logging Out.")
					}
				};

				$rootScope.$on('ChatMultipleSession', function(event){
					var statusMessage = "It seems you are logged in from another place. Going to logout";
					$scope.forceLogout(statusMessage);
				});

				$scope.forceLogout = function(statusMessage){
					$timeout(function(){
						console.log('test' + statusMessage);
						$scope.chatConnectionStatus = statusMessage;
						if($rootScope.chatSDK && $rootScope.chatSDK.connection){
							$rootScope.chatSDK.connection.send($pres({"type": "unavailable"}));
							$rootScope.chatSDK.connection = null;
						}
						// window.location=Globals.AppConfig.logoutUrl;
                	});
				};

				$rootScope.$on('StropheStatusChange', function(event, status, connection){
					$rootScope.chatSDK.connection = connection;
					$rootScope.stropheStatus = status;
					switch(status){
						case Strophe.Status.CONNECTING:
							$rootScope.isLogin = $scope.isLogin = true;
							$scope.chatConnectionStatus = "Connecting";
							break;
						case Strophe.Status.CONNECTED:
							$rootScope.isLogin = $scope.isLogin = true;
							$scope.chatConnectionStatus = "Connected";
							$scope.connectedState();
							break;
						case Strophe.Status.DISCONNECTING:
							break;
						case Strophe.Status.DISCONNECTED:
							$scope.init();
							$scope.loginToChatServer();
							break;
						case Strophe.Status.AUTHENTICATING:
							break;
						case Strophe.Status.ERROR:
							$scope.init();
							$scope.loginToChatServer();
							break;
						case Strophe.Status.CONNFAIL:
							var statusMessage = "It seems you are logged in from another place. Going to logout."
							$scope.forceLogout(statusMessage);
							break;
						case Strophe.Status.AUTHFAIL:
							var statusMessage = "Invalid Credentials while logging to Chat Server. Going to logout."
							$scope.forceLogout(statusMessage);
							break;
						case Strophe.Status.ATTACHED:
							break;
					}
					$timeout(function(){
						$scope.chatConnectionStatus = StropheService.connectionStatus(status);
                    });
				});

				$scope.connectedState = function(){
					$rootScope.chatSDK.connection.addHandler($rootScope.chatSDK.ping_handler, null, "iq", null, "ping1"); 
				    $rootScope.chatSDK.connection.addHandler($rootScope.chatSDK.ping_handler_readACK, null, "iq", null, "readACK");   
				    var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
				    $rootScope.chatSDK.connection.send($pres());
				    $rootScope.chatSDK.connection.addHandler($rootScope.chatSDK.on_message, null, "message", "chat");
				};

				$scope.loginToChatServer = function(){
					$rootScope.plustxtId = $rootScope.tigoId  + '@' + Globals.AppConfig.ChatHostURI;//response.data['tego_id'] + "@" + Globals.AppConfig.ChatHostURI;
					StropheService.connection($rootScope.plustxtId, $rootScope.password);
				};

				$scope.getChatServerCredentials = function(){
					PanelAuthService.chatServerCredentials($rootScope.user.token).query({}, 
						function success(response){
							if(response.status === 1 && response.username && response.password){
								$rootScope.tigoId = response.username;
								$rootScope.password = response.password + response.username.substring(0,3);
								$scope.loginToChatServer();
							}
							else{
								MessageService.displayError("Some error occured while fetching chat server details.");
							}
						}, 
						function failure(error){
							MessageService.displayError("Chat Server user details could not be fetched.");
						})	
				};

				$rootScope.$on('chatConnet', function(){
					if($rootScope.user){
						$scope.init();
						$scope.getChatServerCredentials();
					}
				});

				$scope.logout = function(){
					$scope.init();
					$rootScope.isLogin = $scope.isLogin = false;
					$rootScope.user = null;
					$scope.forceLogout("Logging Out.");
					window.location= window.location.href;

				}
				
			}
    	]);
})(angular);
