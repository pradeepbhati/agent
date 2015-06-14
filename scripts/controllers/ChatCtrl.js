(function (angular){
	"use strict;"
	angular.module('bargain')
		.controller('ChatCtrl', ['$scope', '$rootScope', 'ChatCoreService', 'ChatServerService', 'MessageService', 'UtilService', '$filter', '$timeout',
			function ($scope, $rootScope, ChatCoreService, ChatServerService, MessageService, UtilService, $filter, $timeout) {
				$scope.activeWindows = [];
    			$scope.contact = $rootScope.plustxtcacheobj.contact;
    			$scope.products = $rootScope.plustxtcacheobj.products;
    			$scope.templates = $rootScope.templates;

               function saveState() {
		  if($rootScope.isLogin) {
                  	sessionStorage.plustxtcacheobj = angular.toJson($rootScope.plustxtcacheobj);
		  }
               };

               $rootScope.$on("savestate", saveState);

               function restoreState() {
				$scope.agentId = $rootScope.tigoId;
				$rootScope.plustxtcacheobj = angular.fromJson(sessionStorage.plustxtcacheobj); 
                var chatObj = $rootScope.plustxtcacheobj; 
				$scope.contact = chatObj.contact;
                $scope.allMessages = chatObj.message;
                $scope.products = chatObj.products;
                if($scope.activeWindows.length < Globals.AppConfig.ConcurrentChats){
                                                angular.forEach($scope.allMessages, function(val, key){
                                                        var contactExists = false;
                                                        angular.forEach($scope.activeWindows, function(value, index){
                                                                if (value.threadId == key){
                                                                        value.messages =  val;
                                                                        contactExists = true;
                                                                }
                                                        });
                                                        if(!contactExists){
                                                                if($scope.activeWindows.length == 0){
                                                                        $scope.activeChatUser = key;
                                                                }
                                                                var conversation = {};
                                                                conversation.threadId = key;
                                                                conversation.messages =  val;
                                                                $scope.activeWindows.push(conversation);
                                                        }
                                                })
                                            }
               };

               if (sessionStorage.plustxtcacheobj) restoreState();
    			
    			$scope.$on('Agent-Logout-Request', function(event, activeUser){
    				var activeConversations = 0;
    				angular.forEach($scope.contact, function(value, index){
    					if(value.chatState != "closed" || value.chatState == "open" ){
    						++activeConversations;
    					}
    				})
    				if(activeConversations){
    					$rootScope.logoutRequestRaised = true;
    					MessageService.confirm("You still have " + activeConversations + " active conversation/s. Please close them.")
			              .then(function() {
			              });
    				}
    				else{
    					if($rootScope.chatSDK && $rootScope.chatSDK.connection){
							$rootScope.chatSDK.connection.send($pres({"type": "unavailable"}));
							$rootScope.chatSDK.connection = null;
						}
						window.location=Globals.AppConfig.logoutUrl;
    				}
    			})

    			$scope.$on('Active-User-Changed', function(event, activeUser){
    				$scope.activeChatUser = activeUser;
    			})

    			$scope.$on('Close-User-Chat', function(event, threadId){		
    				$timeout(function(){
    					var closeChatUserIndex;
    					
    					// if($scope.contact[threadId].chatState != "closed"){
    					// 	$scope.contact[threadId].chatState = "closed";
    					// 	var userId = $scope.contact[threadId].id;
	    				// 	UtilService.chatClosed($rootScope.sessionid, userId, "",  threadId);
    					// }
    					angular.forEach($scope.activeWindows, function(value, index){
    						if(value.threadId == threadId){
    							closeChatUserIndex = index;
    						}
    					})
	    				$scope.activeWindows.splice(closeChatUserIndex, 1);
	    				delete $scope.allMessages[threadId];
	    				delete $scope.contact[threadId];
	    				delete $scope.products[threadId];
	    				angular.forEach($scope.contact, function(value, index){
	    					var isChatExist = $filter('filter')($scope.activeWindows, {threadId : index}, true);
							if(isChatExist.length){
								return;
							}
							else if($scope.activeWindows.length < Globals.AppConfig.ConcurrentChats){
								var conversation = {};
								conversation.threadId = value.threadId;
								conversation.messages =  $scope.allMessages[value.threadId];
								$scope.activeWindows.push(conversation);
							}
	    				})
	    				if($scope.activeWindows.length > 0){
	    					$scope.activeChatUser = $scope.activeWindows[0].threadId;
	    				}
                    });
    			})
    			
				$rootScope.$on('ChatObjectChanged', function(event, chatObj){
					$scope.agentId = $rootScope.tigoId;
					$scope.templates = $rootScope.templates;
					$scope.$apply(function(){
				        $scope.contact = chatObj.contact;
				        $scope.allMessages = chatObj.message;
				        $scope.products = chatObj.products;
				        if($scope.activeWindows.length < Globals.AppConfig.ConcurrentChats){
					        angular.forEach($scope.allMessages, function(val, key){
					        	var contactExists = false;
					        	angular.forEach($scope.activeWindows, function(value, index){
					        		if (value.threadId == key){
					        			value.messages =  val;
					        			contactExists = true;
					        		}
					        	});
					        	if(!contactExists){
					        		if($scope.activeWindows.length == 0){
						        		$scope.activeChatUser = key;
						        	}
						        	var conversation = {};
						        	conversation.threadId = key;
						        	conversation.messages =  val;
						        	$scope.activeWindows.push(conversation);
					        	}
					        })
					    }
				    });
				});

				
				$scope.changeActiveWindow = function(user){
					if(user){
						$scope.activeChatUser = user.threadId;
						var isChatExist = $filter('filter')($scope.activeWindows, {threadId : user.threadId}, true);
						if(isChatExist.length){
							return;
						}
						if($scope.activeWindows && $scope.activeWindows.length == Globals.AppConfig.ConcurrentChats){
							var minTime = '';
							var deactiveContact ="";
							angular.forEach($scope.activeWindows, function(value, index){
								var contactTime = $scope.contact[user.threadId].lastActive;
								if(minTime){
									if(minTime > contactTime){
										minTime = contactTime;
										deactiveContact = value.threadId;
									}
								}else{
									minTime = contactTime;
									deactiveContact = value.threadId;
								}
							});
							angular.forEach($scope.activeWindows, function(value, index){
								if(value.threadId == deactiveContact){
									var conversation = {};
						        	conversation.threadId = user.threadId;
						        	conversation.messages =  $scope.allMessages[user.threadId];
						        	$scope.activeWindows[index] = conversation;
								}
							});
						}
					}
				};

				$scope.sendMessage = function(body, jid, timeInMilliSecond, mid, threadId){
					if(body !== ""){
			            var message = $msg({to: jid, "type": "chat", "id": mid}).c('body').t(body).up().c('active', {xmlns: "http://jabber.org/protocol/chatstates"}).up()
			            .c('meta').c('acl', {deleteafter: "-1", canforward: "1", candownload: "1"});
		             	var to = Strophe.getDomainFromJid($rootScope.chatSDK.connection.jid);
             			var ping = $iq({to: to,type: "get",id: "ping1"}).c("ping", {xmlns: "urn:xmpp:ping"});
             			$rootScope.chatSDK.connection.send(ping);
             			UtilService.updateMessageStatus(mid, -1, Strophe.getNodeFromJid(jid), timeInMilliSecond, threadId);
             			var jid_id = $rootScope.chatSDK.jid_to_id(jid);
             			var tigo_id = Strophe.getNodeFromJid(jid);
						$rootScope.chatSDK.send_Read_Notification(jid, jid_id, tigo_id, threadId);
			        }
				};

				$scope.parsedDate = function(ts){
					return UtilService.getLocalTime(ts);
				}

				$scope.getJsonParsedMesg = function(message){
					return JSON.parse(message);
				}

				$scope.getUnReadMessageCount = function(user){
					if(!$scope.allMessages){
						return 0
					}
					var userMessages = $filter('filter')($scope.allMessages[user.threadId], {threadId : user.threadId, state : 0}, true);
					return userMessages.length;
	            };

				$scope.getMesgState = function(state){
					var messageState = "Sending";
					switch(state){
						case 0:
							messageState = "Received"
							break;
						case 1:
							messageState = "Sent"
							break;
						case 2:
							messageState = "Delievered"
							break;
						case 3:
							messageState = "Read"
							break;
					}
					return messageState;
				};

				
      }]);
})(angular);
