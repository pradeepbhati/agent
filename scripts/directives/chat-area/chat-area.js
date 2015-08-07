(function(angular) {
  'use strict';
  angular.module('bargain')
    .directive('chatArea', ['$rootScope', 'UtilService', 'MessageService', 'PanelAuthService', 'ChatServerService', 'WizRocketService', 'LogglyService', 'httpService', '$timeout', 'ChatDSLService', '$modal',
      function($rootScope, UtilService, MessageService, PanelAuthService, ChatServerService, WizRocketService, LogglyService, httpService, $timeout, ChatDSLService, $modal) {
        return {
          restrict: 'EA',
          templateUrl: 'tpl-productColour', //'scripts/directives/chat-area/chat-area-template.html',
          scope: false,
          link: function(scope, element, attrs) {
            scope.contact = scope.contact[scope.chatData.threadId];
            scope.messages = scope.chatData.messages;

            scope.isAppUser = function() {
              var threadId = scope.chatData.threadId;
              if (threadId && threadId.length == 12 && threadId.substring(0, 2) == "91") {
                // Assume whatsapp user with 12 digit thread id
                return false;
              } else {
                // Assume app user with 10 digit username and thread id
                return true;
              }
            };

            scope.$watch('files', function() {
              scope.upload(scope.files);
            });

            scope.closeUserChat = function() {
              if (scope.contact.chatState != "closed") {
                MessageService.confirm("Are you sure you want to close conversation with " + scope.contact.name + " ?")
                  .then(function() {
                    if (scope.isAppUser() == true) {
                      var closeChatAppMessage = scope.getCloseChatAppMessage(scope.chatData.threadId);
                      scope.agentMessage = closeChatAppMessage;
                      scope.submitMessage();
                    }
                    scope.contact.chatState = "closed";
                    //$rootScope.$broadcast("Close-User-Chat", scope.chatData.threadId);
                  });
              } else {
                $rootScope.$broadcast("Close-User-Chat", scope.chatData.threadId);
                PanelAuthService.agentPingCallback($rootScope.user.token).query({
                  score: scope.activeWindows.length - 1
                }, function success(response) {
                  console.log(response);
                }, function failure(error) {
                  console.log(error);
                });
              }
            };

            scope.sendPaymentLink = function(){
              var modalInstance = $modal.open({
                animation: false,
                templateUrl: 'paymentInfo.html',
                controller: 'ModalInstanceCtrl',
                size: 'md',
                resolve: {
                }
              });

              modalInstance.result.then(function (payment) {
                scope.payment = payment;

                var timeInMilliSecond = UtilService.getTimeInLongString();
                var strTimeMii = timeInMilliSecond.toString();
                var messageId = scope.agentId + "-c-" + strTimeMii;
                var mid = messageId.toString();
                var receiver = scope.contact.id;
                var id = scope.chatData.threadId + '@' + Globals.AppConfig.ChatHostURI + "/" + 'whatsapp';

                var message = {
                  can_forward: "true",
                  delete_after: "-1",
                  deleted_on_sender: "false",
                  flags: 0,
                  id: id,
                  last_ts: strTimeMii.substring(0, 10),
                  mid: mid,
                  receiver: scope.contact.id,
                  sender: scope.agentId,
                  sent_on: strTimeMii.substring(0, 10),
                  state: 0,
                  txt: '',
                  isProductDetails: false,
                  isPromoCode: false,
                  threadId: scope.chatData.threadId
                };

                var chatDSL = ChatDSLService.createPaymentLinkDSL(scope.payment.amount, scope.payment.url, scope.isAppUser());
                message['txt'] = chatDSL;
                message['txt'] = ChatDSLService.getChatDSLMessage(message);
                scope.chatData.messages.push(message);
                message['txt'] = chatDSL;
                var jId = scope.contact.id + "@" + Globals.AppConfig.ChatHostURI;
                scope.sendMessage(message, jId, timeInMilliSecond, mid, scope.chatData.threadId);

                LogglyService.sendLog({
                   '_eventType':'message-new',
                   "sender": message.sender,
                   "receiver": message.receiver,
                   "txt":message.txt,
                   "mid":mid,
                   "via":scope.isAppUser() ? 'app': 'whatsapp',
                   "sent_on":message.sent_on
                });   
                scope.agentMessage = "";
              });
            };

            scope.sendFoodForm = function() {
              MessageService.confirm("Are you sure you want to send Food Menu?")
              .then(function() {
                var timeInMilliSecond = UtilService.getTimeInLongString();
                var strTimeMii = timeInMilliSecond.toString();
                var messageId = scope.agentId + "-c-" + strTimeMii;
                var mid = messageId.toString();
                var receiver = scope.contact.id;
                var id = scope.chatData.threadId + '@' + Globals.AppConfig.ChatHostURI + "/" + 'whatsapp';

                var message = {
                  can_forward: "true",
                  delete_after: "-1",
                  deleted_on_sender: "false",
                  flags: 0,
                  id: id,
                  last_ts: strTimeMii.substring(0, 10),
                  mid: mid,
                  receiver: scope.contact.id,
                  sender: scope.agentId,
                  sent_on: strTimeMii.substring(0, 10),
                  state: 0,
                  txt: '',
                  isProductDetails: false,
                  isPromoCode: false,
                  threadId: scope.chatData.threadId
                };

                ChatServerService.pushFoodMenu(mid, receiver)
                .then(function(resp) {
                  var form_id = resp.data.form_id;
                  var chatDSL = ChatDSLService.createFoodDSL(form_id);
                  message['txt'] = chatDSL;
                  message['txt'] = ChatDSLService.getChatDSLMessage(message);
                  scope.chatData.messages.push(message);
                  message['txt'] = chatDSL;
                  var jId = scope.contact.id + "@" + Globals.AppConfig.ChatHostURI;
                  scope.sendMessage(message, jId, timeInMilliSecond, mid, scope.chatData.threadId);

                  // WizRocketService.sendEvent('message-new',{
                  //    "sender": message.sender,
                  //    "receiver": message.receiver,
                  //    "txt":"Food Menu id " + form_id,
                  //    "mid":mid,
                  //    "via":scope.isAppUser() ? 'app': 'whatsapp',
                  //    "sent_on":message.sent_on
                  // });
                  LogglyService.sendLog({
                     '_eventType':'message-new',
                     "sender": message.sender,
                     "receiver": message.receiver,
                     "txt":message.txt,
                     "mid":mid,
                     "via":scope.isAppUser() ? 'app': 'whatsapp',
                     "sent_on":message.sent_on
                  });   
                  scope.agentMessage = "";
                });
              });
            };

            scope.upload = function(files) {
              if (files && files.length == 1) {
                var file = files[0];
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
                  receiver: scope.contact.id,
                  sender: scope.agentId,
                  sent_on: strTimeMii.substring(0, 10),
                  state: 0,
                  txt: '',
                  isProductDetails: false,
                  isPromoCode: false,
                  threadId: scope.chatData.threadId
                };

                MessageService.displaySuccess('Starting file upload.');
                ChatServerService.uploadMedia($rootScope.user.token, messageId, file)
                  .progress(function(evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                  }).success(function(data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    if (data.message == 'Successful upload') {
                      MessageService.displaySuccess('File uploaded successfully.');
                      console.log(data);
                      var imageDSL = ChatDSLService.createImageDSL(data.data.mimetype, data.data.multimedia_id, data.data.thumburl);
                      message['txt'] = imageDSL;
                      message['txt'] = ChatDSLService.getChatDSLMessage(message);
                      scope.chatData.messages.push(message);
                      message['txt'] = imageDSL;
                      var jId = scope.contact.id + "@" + Globals.AppConfig.ChatHostURI;
                      scope.sendMessage(message, jId, timeInMilliSecond, mid, scope.chatData.threadId);
                      WizRocketService.sendEvent('message-new', {
                        "sender": message.sender,
                        "receiver": message.receiver,
                        "txt": message.txt,
                        "mid": mid,
                        "via": scope.isAppUser() ? 'app' : 'whatsapp',
                        "sent_on": message.sent_on
                      });

                      LogglyService.sendLog({
                        '_eventType': 'message-new',
                        "sender": message.sender,
                        "receiver": message.receiver,
                        "txt": message.txt,
                        "mid": mid,
                        "via": scope.isAppUser() ? 'app' : 'whatsapp',
                        "sent_on": message.sent_on
                      });

                      scope.agentMessage = "";
                    } else {
                      MessageService.displayError(data.status + ' ' + data.message);
                    }
                  }).error(function(data, status, headers, config) {
                    MessageService.displayError('Error uploading file: ' + status);
                  });
              } else {
                console.log('No valid file selected for upload');
              };
            };


            scope.setFocus = function() {
              scope.$emit('Active-User-Changed', scope.chatData.threadId);
            };

            scope.focusTextArea = function() {
              var activeUser = scope.contact;
              if (!scope.isAppUser()) {
                ChatServerService.getConsumerMessagingInfo($rootScope.user.token, activeUser.id).query({
                  mobile: activeUser.id
                }, function success(response) {
                  if (response[activeUser.id] && response[activeUser.id] != $rootScope.tigoId) {
                    MessageService.confirm(activeUser.name + '(' + activeUser.id + ') is talking to (' + response[activeUser.id] + ') Do you want to continue messaging with them?', 'Yes, continue chatting', 'No, I will close the chat');
                  }
                }, function failure(error) {
                  console.log(error);
                });
              }
            };

            scope.submitMessage = function(isPromoCode) {
              if (scope.agentMessage.trim() != "") {
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
                  receiver: scope.contact.id,
                  sender: scope.agentId,
                  sent_on: strTimeMii.substring(0, 10),
                  state: 0,
                  txt: scope.agentMessage,
                  isProductDetails: false,
                  isPromoCode: isPromoCode,
                  threadId: scope.chatData.threadId
                };
                scope.chatData.messages.push(message);
                var jId = scope.contact.id + "@" + Globals.AppConfig.ChatHostURI;
                scope.sendMessage(message, jId, timeInMilliSecond, mid, scope.chatData.threadId);
                WizRocketService.sendEvent('message-new', {
                  "sender": message.sender,
                  "receiver": message.receiver,
                  "txt": message.txt,
                  "mid": mid,
                  "via": scope.isAppUser() ? 'app' : 'whatsapp',
                  "sent_on": message.sent_on
                });

                LogglyService.sendLog({
                  '_eventType': 'message-new',
                  "sender": message.sender,
                  "receiver": message.receiver,
                  "txt": message.txt,
                  "mid": mid,
                  "via": scope.isAppUser() ? 'app' : 'whatsapp',
                  "sent_on": message.sent_on
                });

                scope.agentMessage = "";
              }
            };

            scope.loadHistory = function(threadId) {
              scope.showLoader = true;
              var timeStamp = scope.chatData.messages[0].sent_on;
              var nextPage = scope.chatData.nextPage;
              if (!nextPage) {
                nextPage = '';
              }
              var contactId = scope.contact.id;
              ChatServerService.fetchUserHistory($rootScope.user.token, contactId, nextPage).query({

                },
                function success(response) {
                  if (response && response.results) {
                    var messageArray = UtilService.syncHistory(response.results);
                    if (messageArray.length) {
                      $timeout(function() {
                        angular.forEach(messageArray, function(value, index) {
                          // Check if MID is already in messageArray
                          var mExists = false;
                          angular.forEach(scope.chatData.messages, function(existingMessage, eMindex) {
                            if (existingMessage.mid == value.mid) {
                              mExists = true;
                            }
                          });
                          if (!mExists) {
                            scope.chatData.messages.unshift(value);
                          }
                        });
                        scope.messages = scope.chatData.messages;
                      });
                    } else {
                      $timeout(function() {
                        scope.showHistory = false;
                      });
                    }
                    scope.chatData.nextPage = response.next;
                  }
                  scope.showLoader = false;
                },
                function failure(error) {
                  scope.showLoader = false;
                });
            };

            scope.copyChat = function() {
              var formatMsg = "";
              var chatMessage = scope.messages;
              angular.forEach(chatMessage, function(msg, value) {
                formatMsg = formatMsg + msg.sender + '->' + msg.receiver + ' ' + UtilService.getLocalTime(msg.last_ts / 1000) + ': ' + msg.txt + '\n\r';
              });
              MessageService.displaySuccess("All messages have been copied in clip board for  " + scope.contact.id + " (" + scope.contact.name + ")");
              return formatMsg;
            };

            if (scope.isAppUser()) {
              scope.loadHistory(scope.chatData.threadId);
            }

          }
        };
      }
    ]);
})(angular);