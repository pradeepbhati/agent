(function (angular){
	"use strict;"

	angular.module('bargain').factory('ChatCoreService', [ '$rootScope', 'UtilService',
     function ( $rootScope, UtilService ) {

		var ChatCoreService;
		
    var on_Message_Update_Chat = function(response){
      var full_jid = response['full_jid'];
      var composing = response['composing'];
      var body = response['body'];
      var messageId = response['id'];
      var threadId = response['threadId'];
      var isProductDetails = false;
      if(response['id']){
        isSpecialMessage = response['isSpecialMessage'];
      }
      var jid = Strophe.getBareJidFromJid(full_jid);
      var jid_id = UtilService.getJidToId(jid);

      var MessID='mid-'+messageId;
       if (body) {
        var timeInMilliSeconds = messageId.substr(messageId.lastIndexOf('-') + 1, messageId.length);
        var strTimeMii = timeInMilliSeconds.toString().substring(0, 10);
        UtilService.addMessage($rootScope.plustxtId, jid, body, strTimeMii, messageId, isSpecialMessage, threadId);
        //UtilService.updateMessageStatus(messageId, 2, Strophe.getNodeFromJid(jid), UtilService.getTimeInLongString());
      }  
    };
	
    var chatSDK = {
        //it keeps Connection string
        connection: null,
        pingRef : null,
        PingCount: 0,
        reLoad: null,
        readACKO : [],
        kill:"No",
        jid_to_id: function(jid) {
            return Strophe.getBareJidFromJid(jid)
                    .replace("@", "-")
                    .replace(/\./g, "-");
        },

        write_to_log: function(message) {
             console.log(message);
        },

        on_roster: function(iq) {
            $rootScope.chatSDK.write_to_log('ChatCoreService: on_roster called');
            var JsonResponse = {};
            $(iq).find('item').each(function() {
                var Item = {};
                var jid = $(this).attr('jid');
                Item['plustxtId'] = $(this).attr('jid');
                if($(this).attr('name') === undefined){
                  self.guestUserId = self.guestUserId + 1;
                  Item['name'] = "Guest User " + self.guestUserId;
                }
                else{
                   Item['name'] = $(this).attr('name')
                }
                Item['tegoid'] = Strophe.getNodeFromJid(Item['plustxtId']);
                JsonResponse[jid] = Item;
            });
            $rootScope.chatSDK.connection.addHandler($rootScope.chatSDK.on_presence, null, "presence");
            // Send the presence information
            $rootScope.chatSDK.connection.send($pres());
        },

        /*
         function                : presence_value()
         parameters     input    : html li component
         parameters     output   : 
         parameter description   : 
         
         function  description   : sort li components
         
         */
        presence_value: function(elem) {
          if (elem.hasClass('online')) {
            return 2;
          } 
          else if (elem.hasClass('away')) {
              return 1;
          }
          return 0;
        },
        /*
         function                : on_presence()
         parameters     input    : presence stanze
         parameters     output   : 
         parameter description   : 
         
         function  description   : This function is the deault handler for presence stanze
         When a new presence stanze becomes availble, this function will be called .
         This Function will create JSON Object with attributes available in presence and
         call UI function on_Presence_Update_Contact for update UI .
         
         */
        on_presence: function(presence) {

            var ptype = $(presence).attr('type');
            var from = $(presence).attr('from');
            var show = $(presence).find("show").text();
            var JsonResponse = {};
            JsonResponse['jid'] = from;
            JsonResponse['type'] = ptype;
            JsonResponse['show'] = show;
            console.log("ChatCoreService @on_presence", JsonResponse);
            if(Strophe.getNodeFromJid(from) == $rootScope.tigoId){
              var resourceId = Strophe.getResourceFromJid(from);
              if(!$rootScope.resourceId){
                $rootScope.resourceId = resourceId;
              }
              else if(($rootScope.resourceId == resourceId && ptype=="unavailable")){
                $rootScope.$broadcast("ChatMultipleSession");
              }
            }
            return true;

        },
        /*
         function                : on_message()
         parameters     input    : message stanze
         parameters     output   : 
         parameter description   : 
         */
        on_message: function(message) {
            console.log("ChatCoreService @on_message called :");
            var threadId = null;
            if($(message).find("thread")){
              threadId = $(message).find("thread").text();
            }
            var body = $(message).find("html > body");
            if (body.length === 0) {
                body = $(message).find('body');
                if (body.length > 0) {
                    body = body.text().trim();
                } else {
                    body = null;
                }
            } else {
                body = body.contents();
                var span = $("<span></span>");
                body.each(function() {
                    if (document.importNode) {
                        $(document.importNode(this, true)).appendTo(span);
                    } else {
                        span.append(this.xml);
                    }
                });
                body = span;
            }
            console.log("ChatCoreService  @on_message - Message Text :", body);
            var response = {};
            response['full_jid'] = $(message).attr('from');
            response['id'] = $(message).attr('id');


            var jid = $(message).attr('from');
            if(!threadId){
              threadId = Strophe.getNodeFromJid(jid);
            }
            else{
              var res = threadId.match(/-/gi);
              if(!res || res.length == 0){
                threadId = Strophe.getNodeFromJid(jid);
              }
            }
            var messageID = $(message).attr('id');
            response['composing'] = $(message).find('composing');
            if(body){
              response['body'] = body.trim();
            }
            try{
              var productDetail = JSON.parse(body);
              response['isSpecialMessage'] = true;
            }
            catch(e){
              response['isSpecialMessage'] = false;
            }
            response['threadId'] = threadId;

            var DeliveryMessgae = messageID.search("-dv-");
            var readMessageAcknow = messageID.search("-r-");
            // Message stanze is an acknowledment 
            var timeInMilliSecond = UtilService.getTimeInLongString()
            if (DeliveryMessgae != -1) {
                // code for update/ inform the user regarding delivered or read information
                var delivered = $(message).find("delivered");
                try {
                    var deliveryAckID = $(delivered).text();
                } catch (err) {
                }

                var read = $(message).find("read");
                try {
                    var readAckID = $(read).text();
                } catch (err) {
                }
                // Delivery Acknowledgment
                if (deliveryAckID){
                  console.log("@on_message : Status -- DELIVERED From : " + response['full_jid']);
                  UtilService.updateMessageStatus(deliveryAckID, 2, Strophe.getNodeFromJid(jid), timeInMilliSecond, threadId);
                }
                //read  Acknowledgment
                if (readAckID){
                  console.log("@on_message : Status -- READ From : " + response['full_jid']);
                  UtilService.updateMessageStatus(readAckID, 3, Strophe.getNodeFromJid(jid), timeInMilliSecond, threadId);
                }
                $rootScope.$broadcast("ChatObjectChanged", $rootScope.plustxtcacheobj);
            }
            else if(readMessageAcknow != -1){
                var read = $(message).find("read");
                try {
                    var readAckID = $(read).text();
                } catch (err) {
                }
                if (readAckID){
                  console.log("@on_message : Status -- READ From : " + response['full_jid']);
                  UtilService.updateMessageStatus(readAckID, 3, Strophe.getNodeFromJid(jid), timeInMilliSecond, threadId);
                }
                $rootScope.$broadcast("ChatObjectChanged", $rootScope.plustxtcacheobj);
            }
             else {
                console.log("@on_message :New Text Message : " + message.textContent);

                var strTimeMii = timeInMilliSecond.toString();
                var messageId = $rootScope.tigoId + "-dv-" + strTimeMii;
                var mid = messageId.toString();
                // Sending delivery acknowledment back.
                var message2 = $msg({to: response['full_jid'], "type": "chat", "id": mid}).c('delivered').t(messageID).up().c('thread').t(threadId).up().c('meta');
                // $('#mid-'+messageID).html('Delivered&nbsp;');
                on_Message_Update_Chat(response);
                $rootScope.chatSDK.connection.send(message2);
                console.log('@on_message : Delivery Acknowledment Sent ' + message2);
            }
            return true;
        },

       ping_handler : function (iq){
         if($rootScope.chatSDK.kill=="Yes"){
            return false;
         }
          $rootScope.chatSDK.PingCount=0;
          var offmessageArray= UtilService.getAllPendingMessages();       
           var jid;
           var mid;
           var body;
           var threadId;
           var timeInMilliSecond;
           var strTimeMii;
           var message;

           if(offmessageArray == null || offmessageArray === undefined ){
                console.log("All Pending Messages Count:" + "0");
           }
           else{
              console.log("All Pending Messages Count : " + offmessageArray.length);
            for (var i=0 ; i < offmessageArray.length ; i++){
                console.log('tegoid ' + offmessageArray[i]['tegoid']+ ' mid '+offmessageArray[i]['mid']+ 'body '+ offmessageArray[i]['body'])
                jid=offmessageArray[i]['tegoid']+'@' + Globals.AppConfig.ChatHostURI;
                mid=offmessageArray[i]['mid'];
                body=offmessageArray[i]['body'];
                threadId = offmessageArray[i]['threadId'];

                message = $msg({to: jid, "type": "chat", "id": mid}).c('body').t(body).up().c('thread').t(threadId).up().c('active', {xmlns: "http://jabber.org/protocol/chatstates"}).up()
                .c('request', {xmlns: 'urn:xmpp:receipts'}).up().c('meta').c('acl', {deleteafter: "-1", canforward: "1", candownload: "1"});
                $rootScope.chatSDK.connection.send(message);
               timeInMilliSecond = UtilService.getTimeInLongString();
               strTimeMii = timeInMilliSecond.toString();
             //   utility.comn.consoleLogger(' local cache message status upadted from mid '+mid);
               UtilService.updateMessageStatus(mid, 0, Strophe.getNodeFromJid(jid), strTimeMii, threadId);

               // For sending the closed message
               var closeChatMesg = {CLSCHAT : "chat closed" };
               if(body == JSON.stringify(closeChatMesg)){
                 $rootScope.$broadcast("Close-User-Chat", threadId);
               }
            }
           }
          return true;
       },
        send_ping : function(to){
          //   utility.comn.consoleLogger('to from send ping'+ to);
            var ping = $iq({to: to,type: "get",id: "ping1"}).c("ping", {xmlns: "urn:xmpp:ping"});
             utility.comn.consoleLogger('send_ping Called :' +  "to: " + to );
            
           $rootScope.chatSDK.pingRef= setInterval(function (){
                 $rootScope.chatSDK.connection.send(ping);                
             },1000);
            
       },
        send_Read_Notification : function(jid, jid_id, tigo_id, threadId){
          var to = Strophe.getDomainFromJid($rootScope.chatSDK.connection.jid);
          var ping = $iq({to:to,type: "get",id: "readACK"}).c("ping", {xmlns: "urn:xmpp:ping"});
          $rootScope.chatSDK.connection.send(ping);
          var informationObj={};
          informationObj['tigoId']=tigo_id;
          informationObj['timeStamp']= UtilService.getTimeInLongString();
          informationObj['jid']=jid;
          informationObj['jid_id']=jid_id;
          informationObj['threadId']=threadId;
          $rootScope.chatSDK.readACKO.push(informationObj);
        },

        ping_handler_readACK : function (iq){
          if($rootScope.chatSDK.kill=="Yes"){
             return false;
          }
          if ($rootScope.chatSDK.readACKO.length > 0 ) {
          var infoObjec=$rootScope.chatSDK.readACKO.shift();
          var tigo_id=infoObjec['tigoId'];
          var timeStamp=infoObjec['timeStamp'];
          var jid=infoObjec['jid'];
          var jid_id=infoObjec['jid_id'];
          var threadId = infoObjec['threadId'];
          var timeInMilliSecond;
          var strTimeMii;
          var messageId;
          var mid;
          var midreadArray = UtilService.updateMessageStatusAsRead(tigo_id, timeStamp, threadId);
          for (var i = 0; i < midreadArray.length; i++) {
             //  utility.comn.consoleLogger('value of message id when clicking on left side panel'+midreadArray[i]);
              timeInMilliSecond = UtilService.getTimeInLongString();
              strTimeMii = timeInMilliSecond.toString();
              messageId = $rootScope.tigoId + "-r-" + strTimeMii;
              mid = messageId.toString();
              // Create read ack and send the corresoding jabber client/
              // Note that since it is an delivery/ read ack , message ID containd -div- attributes
              var message2 = $msg({to: jid, "type": "chat", "id": mid}).c('read').t(midreadArray[i]).up().c('thread').t(threadId).up().c('meta');
              $rootScope.chatSDK.connection.send(message2);
              console.log('Read Acknowledgement Sent: ' + message2);
            }
          }
          return true;
        }           
  };


		ChatCoreService = {
      		chatSDK: chatSDK,
      	}

		return ChatCoreService;
	}]);
})(angular);

