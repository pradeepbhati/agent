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

          scope.closeUserChat = function(){
            if(scope.contact.chatState != "closed"){
              MessageService.confirm("Are you sure you want to close conversation with " + scope.contact.name + " ?")
              .then(function() {
                $rootScope.$broadcast("Close-User-Chat", scope.chatData.threadId);
              });
            }
            else{
              $rootScope.$broadcast("Close-User-Chat", scope.chatData.threadId);
            }
          };

          scope.setFocus = function(){
            scope.$emit('Active-User-Changed', scope.chatData.threadId);
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
              }
              scope.chatData.messages.push(message);
              var jId = scope.contact.id + "@" + Globals.AppConfig.ChatHostURI;
              scope.sendMessage(message, jId, timeInMilliSecond, mid, scope.chatData.threadId);
              scope.agentMessage = "";
            }
          };

        scope.loadHistory = function(threadId){
            scope.showLoader=true;
            var timeStamp = scope.chatData.messages[0].sent_on;
            var contactId = scope.contact.id;
            ChatServerService.fetchUserHistory($rootScope.user.token, contactId).query(
            {
              
            },
             function success(response){
              if(response &&  response.messages){
                  var messageArray = UtilService.syncHistory(response.messages, '9591418090');
                  if(messageArray.length){
                    $timeout(function(){
                      angular.forEach(messageArray, function(value, index){
                        scope.chatData.messages.unshift(value);
                      })
                      scope.messages =  scope.chatData.messages;
                    })
                  }
                  else{
                    $timeout(function(){
                      scope.showHistory = false;
                    })
                  }
              }
              scope.showLoader=false;       
            }, function failure(error){
              scope.showLoader=false;  
            })
        };

        scope.copyChat = function(){
          var formatMsg = "";
          var chatMessage = scope.messages;
          angular.forEach(chatMessage, function(msg, value){
            if(msg.receiver == $rootScope.tigoId){
               formatMsg = formatMsg + msg.sender + ' '+ UtilService.getLocalTime(msg.last_ts) + ': ' + msg.txt + '\n\r';
            }else{
              formatMsg = formatMsg + $rootScope.tigoId + ' '+ UtilService.getLocalTime(msg.last_ts) +': ' + msg.txt + '\n\r';
            }
          });
          MessageService.displaySuccess("All messages have been copied in clip board for  " + scope.contact.id + " (" + scope.contact.name + ")");
          return formatMsg;
        };

          

          }
        }
    }]);
})(angular);
