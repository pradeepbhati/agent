(function (angular){
  'use strict';
  angular.module('bargain')
    .directive('chatArea', ['$rootScope', 'UtilService', 'MessageService', 'ChatServerService', 'httpService', '$timeout', 
        function($rootScope, UtilService, MessageService, ChatServerService, httpService, $timeout) {
      return {
        restrict: 'EA',
        templateUrl: 'tpl-productColour', //'scripts/directives/chat-area/chat-area-template.html',
        scope: false,
        link: function(scope, element, attrs) {         
            scope.contact = scope.contact[scope.chatData.threadId];
            scope.messages = scope.chatData.messages;
	    
	    scope.isAppUser = function(){
		var threadId = scope.chatData.threadId;
	  	if(threadId && threadId.length == 12 && threadId.substring(0,2) == "91"){
			// Assume whatsapp user with 12 digit thread id
			return false;
		}
		else {
			// Assume app user with 10 digit username and thread id
			return true;
		}
	  };

          scope.closeUserChat = function(){
            if(scope.contact.chatState != "closed"){
              MessageService.confirm("Are you sure you want to close conversation with " + scope.contact.name + " ?")
              .then(function() {
		if(scope.isAppUser() == true){
			var closeChatAppMessage = scope.getCloseChatAppMessage(scope.chatData.threadId);
			scope.agentMessage = closeChatAppMessage;
	                scope.submitMessage();	
		}
		scope.contact.chatState = "closed";
                //$rootScope.$broadcast("Close-User-Chat", scope.chatData.threadId);
              });
            }
            else{
              $rootScope.$broadcast("Close-User-Chat", scope.chatData.threadId);
            }
          };

          scope.setFocus = function(){
            scope.$emit('Active-User-Changed', scope.chatData.threadId);
          };

	  scope.focusTextArea = function(){
	  	var activeUser = scope.contact;
                                ChatServerService.getConsumerMessagingInfo($rootScope.user.token,activeUser.id).query({
                                        mobile: activeUser.id
                                }, function success(response){
                                        if(response[activeUser.id] && response[activeUser.id] != $rootScope.tigoId){
                                                MessageService.confirm(activeUser.name + '(' + activeUser.id + ') is talking to ('+response[activeUser.id]+') Do you want to continue messaging with them?', 'Yes, continue chatting','No, I will close the chat');
                                        }
                                }, function failure(error){
                                        console.log(error);
                                });
	  };

          scope.submitMessage = function(isPromoCode){
            if(scope.agentMessage.trim() != ""){
              var timeInMilliSecond = UtilService.getTimeInLongString();
              var strTimeMii = timeInMilliSecond.toString();
              var messageId = scope.agentId + "-c-" + strTimeMii;
              var mid = messageId.toString();
              var id = scope.chatData.threadId + '@' + Globals.AppConfig.ChatHostURI + "/" + 'whatsapp';

              var message = {
                can_forward: "true",
                delete_after: "-1",
                deleted_on_sender: "false",
                flags: 0,
                id: id,
                last_ts: strTimeMii.substring(0, 10),
                mid: mid,
                receiver: scope.contact.id ,
                sender: scope.agentId,
                sent_on: strTimeMii.substring(0, 10),
                state: 0,
                txt: scope.agentMessage.replace(/\r?\n/g, " "),
                isProductDetails : false,
                isPromoCode : isPromoCode,
                threadId : scope.chatData.threadId
              };
              scope.chatData.messages.push(message);
              var jId = scope.contact.id + "@" + Globals.AppConfig.ChatHostURI;
              scope.sendMessage(message, jId, timeInMilliSecond, mid, scope.chatData.threadId);
              scope.agentMessage = "";
            }
          };

        scope.loadHistory = function(threadId){
            scope.showLoader=true;
            var timeStamp = scope.chatData.messages[0].sent_on;
	    var nextPage = scope.chatData.nextPage;
	    if(!nextPage){
		nextPage = '';
	    }
            var contactId = scope.contact.id;
            ChatServerService.fetchUserHistory($rootScope.user.token, contactId, nextPage).query(
            {
		
            },
             function success(response){
              if(response &&  response.results){
                  var messageArray = UtilService.syncHistory(response.results);
                  if(messageArray.length){
                    $timeout(function(){
			angular.forEach(messageArray, function(value, index){
			    // Check if MID is already in messageArray
			    var mExists = false;
			    angular.forEach(scope.chatData.messages, function(existingMessage, eMindex){
				if(existingMessage.mid == value.mid){
				    mExists = true;
				}
			    });
			    if(!mExists){
				scope.chatData.messages.unshift(value);
			    }
                      });
                      scope.messages =  scope.chatData.messages;
                    });
                  }
                  else{
                    $timeout(function(){
                      scope.showHistory = false;
                    });
                  }
		  scope.chatData.nextPage = response.next;
              }
              scope.showLoader=false;       
            }, function failure(error){
              scope.showLoader=false;  
            });
        };

        scope.copyChat = function(){
          var formatMsg = "";
          var chatMessage = scope.messages;
          angular.forEach(chatMessage, function(msg, value){
              formatMsg = formatMsg + msg.sender + '->' + msg.receiver + ' '+ UtilService.getLocalTime(msg.last_ts/1000) +': ' + msg.txt + '\n\r';
          });
          MessageService.displaySuccess("All messages have been copied in clip board for  " + scope.contact.id + " (" + scope.contact.name + ")");
          return formatMsg;
        };

            if(scope.isAppUser()){
		scope.loadHistory(scope.chatData.threadId);
	    }

        }
      };
    }]);
})(angular);
