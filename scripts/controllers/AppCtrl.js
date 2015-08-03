(function (angular){
	"use strict;"
	angular.module('bargain')
		.controller('AppCtrl', ['$scope', '$rootScope', 'ChatServerService', 'StropheService', 'ChatCoreService', 'PanelAuthService', 'MessageService', 'TemplateService','UtilService', 'IntimationService', '$timeout', '$cookieStore', 'LogglyService',
			function ($scope, $rootScope, ChatServerService, StropheService, ChatCoreService, PanelAuthService, MessageService, TemplateService, UtilService, IntimationService, $timeout, $cookieStore, LogglyService) {

				$scope.init =function(){
					// $rootScope.bargainAgent = user;
					$rootScope.chatSDK = ChatCoreService.chatSDK;
					$rootScope.plustxtId = null;
					$rootScope.sessionid = null;
					$rootScope.tigoId = null;
					$rootScope.isLogoutRequestPending = false;
					$rootScope.resourceId = null;
					if(!$rootScope.plustxtcacheobj) {
						$rootScope.plustxtcacheobj = {};
						$rootScope.plustxtcacheobj.contact = {};
						$rootScope.plustxtcacheobj.message = {};
						$rootScope.plustxtcacheobj.products = {};
					}
					$rootScope.flashMessage = "";
					$rootScope.password = null;
					$rootScope.usersCount = 0;
					$rootScope.logoutRequestRaised = null;
				};

               function saveState() {
				  if($rootScope.isLogin) { 
				  	sessionStorage.agentId = angular.toJson($rootScope.tigoId);
				  }
               };

               $rootScope.$on("savestate", saveState);

               function restoreState() {
		 			$rootScope.tigoId = angular.fromJson(sessionStorage.tigoId);
               };

               if (sessionStorage.tigoId) restoreState();				

				$rootScope.$on('ChatMultipleSession', function(event){
					var statusMessage = "It seems you are logged in from another place. Going to logout";
					$scope.forceLogout(statusMessage);
				});

				$scope.forceLogout = function(statusMessage){
					$timeout(function(){
						$scope.chatConnectionStatus = statusMessage;
						if($rootScope.chatSDK && $rootScope.chatSDK.connection){
							StropheService.disconnect($rootScope.chatSDK.connection);
							$rootScope.chatSDK.connection = null;
							//window.location= window.location.href;
						}
                	});
				};

				$rootScope.$on('StropheStatusChange', function(event, status, connection){
					$rootScope.chatSDK.connection = connection;
					$rootScope.stropheStatus = status;
					switch(status){
						case Strophe.Status.CONNECTING:
							LogglyService.sendLog({
								'_eventType':'stropheStatus',
								'status':'connecting',
								'agent':$rootScope.tigoId
							});			
							$rootScope.isLogin = $scope.isLogin = true;
							$scope.chatConnectionStatus = "Connecting";
							break;
						case Strophe.Status.CONNECTED:
							LogglyService.sendLog({
								'_eventType':'stropheStatus',
								'status':'connected',
								'agent':$rootScope.tigoId
							});			
							$rootScope.isLogin = $scope.isLogin = true;
							$scope.chatConnectionStatus = "Connected";
							$scope.connectedState();
							break;
						case Strophe.Status.DISCONNECTING:
							LogglyService.sendLog({
								'_eventType':'stropheStatus',
								'status':'disconnecting',
								'agent':$rootScope.tigoId
							});			
							break;
						case Strophe.Status.DISCONNECTED:
							LogglyService.sendLog({
								'_eventType':'stropheStatus',
								'status':'disconnected',
								'agent':$rootScope.tigoId
							});			
							if(!$rootScope.isLogoutRequestPending){
								$scope.loginToChatServer();
							}
							else{
								//window.location= window.location.href;
							}
							break;
						case Strophe.Status.AUTHENTICATING:
							LogglyService.sendLog({
								'_eventType':'stropheStatus',
								'status':'authenticating',
								'agent':$rootScope.tigoId
							});			
							break;
						case Strophe.Status.ERROR:
							LogglyService.sendLog({
								'_eventType':'stropheStatus',
								'status':'error',
								'agent':$rootScope.tigoId
							});			
							$scope.init();
							$scope.loginToChatServer();
							break;
						case Strophe.Status.CONNFAIL:
							LogglyService.sendLog({
								'_eventType':'stropheStatus',
								'status':'connfail',
								'agent':$rootScope.tigoId
							});			
							$scope.chatConnectionStatus = "It seems you are logged in from another place. Going to logout.";
							$cookieStore.remove('agentKey');
							sessionStorage.clear();
							window.location= window.location.href;
							break;
						case Strophe.Status.AUTHFAIL:
							LogglyService.sendLog({
								'_eventType':'stropheStatus',
								'status':'connfail',
								'agent':$rootScope.tigoId
							});			
							$scope.chatConnectionStatuse = "Invalid Credentials while logging to Chat Server. Going to logout."
							//$scope.forceLogout(statusMessage);
							break;
						case Strophe.Status.ATTACHED:
							LogglyService.sendLog({
								'_eventType':'stropheStatus',
								'status':'attached',
								'agent':$rootScope.tigoId
							});			
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
							if(response.username && response.password){
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
						});
				};

				$rootScope.$on('chatConnet', function(){
					if($rootScope.user){
						$scope.init();
						$scope.getChatServerCredentials();
					}
				});

			    $scope.logout = function(){
				
				LogglyService.sendLog({
					'_eventType':'logoutInitiated',
					'agent':$rootScope.tigoId
				});			
				
				if($rootScope.plustxtcacheobj){
				    console.log($rootScope.plustxtcacheobj);
				    var contactsOnPage = $rootScope.plustxtcacheobj.contact;
				    var size = 0, key;
				    for (key in contactsOnPage) {
					if (contactsOnPage.hasOwnProperty(key)) size++;
				    }
				    if(size){
					MessageService.displayBlockingError(size.toString()+' chat windows are open. Please close them before logging out.').then(function(){
					    console.log('Agent tried to logout with active windows');
					});
					return;
				    }
				}
					PanelAuthService.agentPingCallback($rootScope.user.token).query({
						score : Globals.AppConfig.MaxAgentUsers
					}, function success(response){
						$scope.init();
						$cookieStore.remove('agentKey');
						sessionStorage.clear();
						$rootScope.isLogoutRequestPending = true;
						$scope.forceLogout("Logging Out.");
						
						PanelAuthService.agentPanelLogout.query({
							key : $rootScope.user.token
						},function success(response){
							LogglyService.sendLog({
								'_eventType':'loggedOut',
								'token':$rootScope.user.token,
								'pingCallback':'success',
								'agent':$rootScope.tigoId
							});			
							$rootScope.isLogin = $scope.isLogin = false;
							$rootScope.user = null;
							$rootScope.plustxtcacheobj = null;
						},function failure(error){
							LogglyService.sendLog({
								'_eventType':'logoutFailure',
								'token':$rootScope.user.token,
								'pingCallback':'success',
								'agent':$rootScope.tigoId
							});
							$rootScope.isLogin = $scope.isLogin = false;
							$rootScope.user = null;
							$rootScope.plustxtcacheobj = null;
						});
					}, function failure(error){
						MessageService.displayError("Some error occured while logging out.");
						PanelAuthService.agentPanelLogout.query({
							key : $rootScope.user.token
						},function success(response){
							LogglyService.sendLog({
								'_eventType':'loggedOut',
								'token':$rootScope.user.token,
								'pingCallback':'failure',
								'agent':$rootScope.tigoId
							});			
							$rootScope.isLogin = $scope.isLogin = false;
							$rootScope.user = null;
							$rootScope.plustxtcacheobj = null;
						},function failure(error){
							LogglyService.sendLog({
								'_eventType':'logoutFailure',
								'token':$rootScope.user.token,
								'pingCallback':'failure',
								'agent':$rootScope.tigoId
							});
							$rootScope.isLogin = $scope.isLogin = false;
							$rootScope.user = null;
							$rootScope.plustxtcacheobj = null;
						});
					});
				};

				$scope.reconnectConnection =function(){
					if($rootScope.chatSDK.connection){
						StropheService.disconnect($rootScope.chatSDK.connection);
					}
				};
				
			}
    	]);
})(angular);
