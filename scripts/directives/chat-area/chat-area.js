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
          scope.templates = scope.templates;
          scope.contact = scope.contact[scope.chatData.threadId];
          scope.messages = scope.chatData.messages;

          scope.openDefaultTemplates = function(){
            scope.showPromo = false;
            scope.showProduct = false;
            scope.showTemplates = !scope.showTemplates;
          }

          scope.qty = 1;
          //date picker
          scope.promoType = 'percentage';
          scope.format = 'dd/MM/yyyy';
          scope.defaultDateForPromoCode = function() {
            var someDate = new Date();
            var numberOfDaysToAdd = Globals.AppConfig.DefaultPromoCodeValidityDays;  // For default date validity of promo code.
            someDate.setDate(someDate.getDate() + numberOfDaysToAdd); 
            scope.validDate = someDate;
          };
          scope.defaultDateForPromoCode();
          scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            scope.opened = true;
          };
          scope.toggleMin = function() {
            scope.minDate = (scope.minDate ) ? null : new Date();
          };
          scope.toggleMin();
          //date picker

          scope.closeUserChat = function(){
            console.log("Delete Chat from this user: ", scope.contact.id);
            if(scope.contact.chatState != "closed"){
              MessageService.confirm("Are you sure you want to close conversation with " + scope.contact.name + " ?")
              .then(function() {
                var body = {CLSCHAT : "chat closed" };
                body = UtilService.stringifyEmitUnicode(body, true);
                scope.agentMessage = body;
                scope.submitMessage(false);
              });
            }
            else{
              var body = {CLSCHAT : "chat closed" };
              body = UtilService.stringifyEmitUnicode(body, true);
              scope.agentMessage = body;
              scope.submitMessage(false);
            }
          }

          scope.setFocus = function(){
            scope.$emit('Active-User-Changed', scope.chatData.threadId);
          }
          scope.removeFocus = function(){
          }

          scope.openPromoWindow = function(){
            scope.hideError();
            scope.showPromo = true;
            scope.showProduct = false;
            scope.showTemplates = false;
          };

          scope.closeWindow = function(){
            scope.showPromo = false;
            scope.showProduct = false;
            scope.showTemplates = false;
          };

          scope.showProductDetail = function(){
            scope.showProduct = !scope.showProduct;
            scope.showPromo = false;
            scope.showTemplates = false;
          };

          scope.setPromoType = function(type){
            scope.promoType= type;
          }

          scope.setFreeShip = function(){
            scope.isFreeShiping = !scope.isFreeShiping;
          }
          scope.$watch('promoType', function(value) {
            if(scope.promoType == 'percentage'){
              scope.absoluteCap = "";
            }else{
              scope.capLimit = "";
              scope.percentCap = "";
            }
          });

          scope.getProductDetail = function(){
            if(!scope.productDetail){
              scope.showLoader=true;
              var productUrl =  Globals.AppConfig.productUrl + scope.products[scope.chatData.threadId].productId;
              var svc = httpService.callFunc(productUrl);
              svc.get().then(function(response){
                if (response) {
                  console.log(response);
                  scope.productDetail = response;
                  scope.showProductDetail();
                }
                scope.showLoader=false;
              }, function(error){
                MessageService.displayError("Error occured in fetching the product details for " + scope.userName);
                console.log(error);
                scope.showLoader=false;
              });
            }
            else{
              scope.showProductDetail();
            }
          };
          scope.hideError = function(){
            scope.promoError = false;
            scope.percentCapError = ''; scope.capLimitError = ''; scope.qtyError = '';
            scope.validDateError = '';scope.absoluteCapError = '';
          };

          scope.validatePromocode = function(){
            scope.hideError();
            // scope.promoError = false;
            if(scope.promoType == 'percentage'){
              if(!scope.percentCap){ 
                scope.percentCapError = "Discount % is required" ;
              }
              else if(scope.percentCap > 50){
                scope.percentCapError = "Please enter a value less than 50";
              }
              else if(scope.percentCap <= 0){
                scope.percentCapError = "Please enter a value greater than 0";
              }  
              if(!scope.capLimit){ 
                scope.capLimitError = "Please enter upper limit"
              }
              else if(scope.capLimit <= 0){
                scope.capLimitError = "Please enter a limit greater than 0"
              }
            }else{
              if(!scope.absoluteCap){
                scope.absoluteCapError = "Discount amount is required"
              }
              else if(scope.absoluteCap <= 0){
                scope.absoluteCapError = "Please enter a value greater than 0"
              }
            }
            if(!scope.qty){
              scope.qtyError = "Please enter minimum quantity";
            }
            else if (scope.qty <= 0){
              scope.qtyError = "Please enter a value greater than 0";
            }
            else if (scope.qty >5){
              scope.qtyError = "Please enter a value less than 5";
            }
            if(!scope.validDate){scope.validDateError = "Please enter validity date"}
            if(scope.percentCapError || scope.capLimitError || scope.qtyError || scope.validDateError 
              || scope.absoluteCapError ){
              scope.promoError = true;
            }
            return scope.promoError;
          };

          scope.savePromo = function(){
            scope.agentMessage = '';
            var bargainPromo =  Globals.AppConfig.PromoCodeCreate;
            if(!scope.validatePromocode()){
              scope.showLoader=true;
              var promoObj = {};
              promoObj.action = scope.promoType;
              promoObj.value =  scope.promoType == 'percentage' ? scope.percentCap : scope.absoluteCap;
              promoObj.cap = scope.promoType == 'percentage' ? scope.capLimit : "";
              promoObj.qty = scope.qty;
              if(scope.isFreeShiping){
                promoObj.freeshipping = scope.isFreeShiping;
              }
              if(scope.products && scope.products[scope.chatData.threadId]){
                promoObj.product_id = scope.products[scope.chatData.threadId].productId;
                promoObj.user_id = scope.products[scope.chatData.threadId].userId;
                promoObj.valid_upto = new Date(scope.validDate).getTime();

                var discountVal = "";
                if(scope.promoType == 'percentage'){
                  var discount = Math.round(scope.percentCap * scope.products[scope.chatData.threadId].price)/100;
                  if(promoObj.cap != ""){
                    discountVal = (discount > promoObj.cap) ?  promoObj.cap : discount ;
                  }
                  else{
                    discountVal = discount;
                  }
                }
                else{
                  discountVal = scope.absoluteCap;
                }

                var svc = httpService.callFunc(bargainPromo);
                svc.post(promoObj).then(function(response){
                  if (response) {
                    var promoCodeData = {
                      message : response.success_message.trim().replace('${amount}', discountVal).replace("Code applied:" , "Use Code:"),
                      promocode : response.code,
                      validity : moment(response.valid_upto).format("MMM Do, h:mm a") ,
                      minQuantity : promoObj.qty
                    } 
                    var promoCodeMessage = {PRMCODE: promoCodeData} ;
                    scope.agentMessage = UtilService.stringifyEmitUnicode(promoCodeMessage, true);
                    scope.submitMessage(true);
                    scope.showPromo = !scope.showPromo;
                    MessageService.displaySuccess("Promo code generated for " + scope.userName );
                  }
                  scope.showLoader=false;
                }, function(errorObj){
                  MessageService.displayError("Error in generating the promo code for " + scope.userName + " : " + errorObj.error);
                  scope.showLoader=false;
                });
              }
              else{
                scope.showLoader=false;
                MessageService.displayError("No product details available. Promo code could not be generated for  " + scope.userName);
              }
            }
          };

          scope.submitTemplate = function(templateMessage){
            console.log(templateMessage);
            if(templateMessage){
              scope.agentMessage = templateMessage;
              scope.submitMessage(false);
              scope.closeWindow();
              // scope.showTemplates = !scope.showTemplates;
            }
          };

          scope.submitMessage = function(isPromoCode){
            if(scope.agentMessage.trim() != ""){
              var timeInMilliSecond = UtilService.getTimeInLongString();
              var strTimeMii = timeInMilliSecond.toString();
              var messageId = scope.agentId + "-c-" + strTimeMii;
              var mid = messageId.toString();

              var message = {
                can_forward: "true",
                delete_after: "-1",
                deleted_on_sender: "false",
                flags: 0,
                id: "",
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
          }

          scope.loadHistory = function(userId){
            alert("History Called for " + userId);  
            ChatServerService.fetchUserHistory.query({
              session_id : $rootScope.sessionid,
              converser : userId,
              merchant_id : 1
            }, function success(response){
              console.log(response.data.messages);
              if(response && response.data && response.data.messages){
                //$timeout(function(){
                  var messageArray = UtilService.syncHistory(response.data.messages);
                  $timeout(function(){
                    scope.chatData.messages = messageArray;
                    scope.messages = messageArray;
                  })
                  // $scope.allMessages[userId] = messageArray;
                  // angular.forEach($scope.activeWindows, function(value, index){
                  //       if (value.userId == userId){
                  //         value.messages =  messageArray;
                  //       }
                  //     });
                // });
              }       
            }, function failure(error){
              // console.log("Templates could not be loaded.")
            })
        }

          

          }
        }
    }]);
})(angular);
