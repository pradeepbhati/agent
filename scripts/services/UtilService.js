(function (angular){
	"use strict;"

	angular.module('bargain').factory('UtilService', ['$rootScope', 'IntimationService', function ($rootScope, IntimationService) {
		var ua = navigator.userAgent.toLowerCase();
		var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		if (ua.indexOf(" chrome/") >= 0 || ua.indexOf(" firefox/") >= 0 || ua.indexOf(' gecko/') >= 0) {
		    var StringMaker = function() {
		        this.str = "";
		        this.length = 0;
		        this.append = function(s) {
		            this.str += s;
		            this.length += s.length;
		        }
		        this.prepend = function(s) {
		            this.str = s + this.str;
		            this.length += s.length;
		        }
		        this.toString = function() {
		            return this.str;
		        }
		    }
		} else {
		    var StringMaker = function() {
		        this.parts = [];
		        this.length = 0;
		        this.append = function(s) {
		            this.parts.push(s);
		            this.length += s.length;
		        }
		        this.prepend = function(s) {
		            this.parts.unshift(s);
		            this.length += s.length;
		        }
		        this.toString = function() {
		            return this.parts.join('');
		        }
		    }
		}

		decode64 = function(input) {
		    var output = new StringMaker();
		    var chr1, chr2, chr3;
		    var enc1, enc2, enc3, enc4;
		    var i = 0;
		    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
		    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		    while (i < input.length) {
		        enc1 = keyStr.indexOf(input.charAt(i++));
		        enc2 = keyStr.indexOf(input.charAt(i++));
		        enc3 = keyStr.indexOf(input.charAt(i++));
		        enc4 = keyStr.indexOf(input.charAt(i++));
		        chr1 = (enc1 << 2) | (enc2 >> 4);
		        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		        chr3 = ((enc3 & 3) << 6) | enc4;
		        output.append(String.fromCharCode(chr1));
		        if (enc3 != 64) {
		            output.append(String.fromCharCode(chr2));
		        }
		        if (enc4 != 64) {
		            output.append(String.fromCharCode(chr3));
		        }
		    }
		    return output.toString();
		};

		var guid = (function() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
			}
			return function() {
				return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
			};
		})();

		var stringifyEmitUnicode = function(validObj, emitUnicode){
			var json = JSON.stringify(validObj);
             return emitUnicode ? json : json.replace(/[\u007f-\uffff]/g,
                function(c) { 
                  return '\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4);
                }
             );
		};

		var getTimeInLongString = function(){
          return new Date().getTime();
        };

        parseTime = function(dateString){
			var parseDate = new Date();
			if(dateString){
				var date = new Date (dateString);
				var momentDate = moment(dateString);
				parseDate = momentDate.format("h:mm a");
			}
			return parseDate;
		};

		parseDate = function(dateString){
			var parseDate = new Date();
			if(dateString){
				var date = new Date (dateString);
				var momentDate = moment(dateString);
				parseDate = momentDate.format("DD MMM YYYY");
			}
			return parseDate;
		};

		var getLocalTime = function(ts) {
			return moment.unix(ts).format("Do MMM  h:mm A");
            //return moment.unix(ts).format("MMM Do, h:mm:ss a");
        };

        var milliTimeToString = function(inMilliSeconds) {
		    var date = new Date(inMilliSeconds);
		    var strTime = parseDate(date) + " "+ parseTime(date);
		    return strTime;
		};

        var jIdToId = function(jid) {
	        return Strophe.getBareJidFromJid(jid).replace("@", "-").replace(/\./g, "-");
    	};

    	var syncHistory = function(messageList){
        	var messageArray = []; var state = 0;
        	angular.forEach(messageList, function(value, index){
        		var messageObj ={};
        		messageObj['deleted_on_sender'] = value['deleted_on_sender'];
	            messageObj['sender'] = value['sender'];
	            messageObj['receiver'] = value['receiver'];
	            messageObj['can_forward'] = value['can_forward'];
	            messageObj['delete_after'] = value['delete_after'];
	            messageObj['last_ts'] = value['last_ts'];
	            messageObj['sent_on'] = value['sent_on'];
	            messageObj['via'] = value['via'] ? value['via'].toLowerCase() : "whatsapp";
	            try{
	                messageObj['txt'] = decode64(value['txt']);
	            }
	            catch(e){
	                
	            }
	            messageObj['id'] = value['receiver'] + '@' + Globals.AppConfig.ChatHostURI + "/" + value['via'];
	            messageObj['mid'] = value['mid'];
	            messageObj['flags'] = 0;
	            if (value['read_on'] != undefined)
	                state = 3;
	            else if (value['received_on'] != undefined)
	                state = 2;
	            else if (value['sent_on'] != undefined)
	                state = 1;
	            else
	                state = 0;
	            messageObj['state'] = state;//0-sending;1-sent;2-Delivered;3-read
	            if(value['sender'] && value['receiver']){
            	//if(value['sender']){
	                messageArray.push(messageObj);
	            }
        	})
			return messageArray;
	    };

    	var getAllPendingMessages = function(){
	        var messageArray = [];
	        var offlinemessage;
	        var midread = new Array();
	        var MessageList = $rootScope.plustxtcacheobj['message'];
	        for (var key in MessageList)
	        {
	            messageArray = $rootScope.plustxtcacheobj['message'][key];
	            for (var key1 in messageArray)
	            {
	                if (messageArray[key1]['state'] == -1) {      
	                    offlinemessage = {};
	                    offlinemessage['id'] = messageArray[key1]['id'];
	                    offlinemessage['tegoid'] = messageArray[key1]['receiver'];
	                    offlinemessage['body'] = messageArray[key1]['txt']
	                    offlinemessage['mid'] = messageArray[key1]['mid'];
	                    offlinemessage['threadId'] = messageArray[key1]['threadId'];
	                    midread[midread.length] = offlinemessage;
	                }
	            }
	        }
	        return midread;
	    };

	    var updateMessageStatus = function(inmessageid, instatus, inotherpartytigoid, intime, threadId){
	        //var messageArray =  $rootScope.plustxtcacheobj['message'][inotherpartytigoid];
	        var messageArray =  $rootScope.plustxtcacheobj['message'][threadId];
	        for (var key in messageArray)
	        {
	            if (messageArray[key]['mid'] == inmessageid) {
	                messageArray[key]['state'] = instatus;
	                messageArray[key]['last_ts'] = intime;
	            }
	        }
	        // messageArray can be undefined after close chat
	        if(messageArray){
	        	//$rootScope.plustxtcacheobj['message'][inotherpartytigoid] = messageArray;
	        	$rootScope.plustxtcacheobj['message'][threadId] = messageArray;
	    	}
	    };

	    var updateMessageStatusAsRead = function(inotherpartytigoid, intime, threadId){
	    	var messageArray = $rootScope.plustxtcacheobj['message'][threadId];
			//var messageArray = $rootScope.plustxtcacheobj['message'][inotherpartytigoid];
			var midread = [];
			for (var key in messageArray)
			{
			    if (messageArray[key]['state'] == 0 && messageArray[key]['sender'] == inotherpartytigoid) {
			        messageArray[key]['state'] = 3;
			        messageArray[key]['last_ts'] = intime;
			        midread[midread.length] = messageArray[key]['mid'];
			    }
			}
			// messageArray can be undefined after close chat
			if(messageArray){
				//$rootScope.plustxtcacheobj['message'][inotherpartytigoid] = messageArray;
				$rootScope.plustxtcacheobj['message'][threadId] = messageArray;
			}
			return midread;
		};

    	var addMessage = function(inRecieverJID, fullJID, inMessage, inTime, mid, isSpecialMessage, threadId, via) {
        	var otherpartyid;
	        var messagelist = [];
	        var inSenderJID = Strophe.getBareJidFromJid(fullJID);
	        var receiverTigoId = inRecieverJID.substring(0, inRecieverJID.lastIndexOf('@'));
	        var senderTigoId = inSenderJID.substring(0, inSenderJID.lastIndexOf('@'));
	        senderTigoId = senderTigoId.length == 12  &&  senderTigoId.substring(0,2) == 91 ? senderTigoId.substring(2, senderTigoId.length) : senderTigoId;
	        var messageobj = {};
	        messageobj['deleted_on_sender'] = "false";
	        messageobj['sender'] = senderTigoId;
	        messageobj['receiver'] = receiverTigoId;
	        messageobj['can_forward'] = "true";
	        messageobj['delete_after'] = "-1";
	        messageobj['last_ts'] = inTime;
	        messageobj['sent_on'] = inTime;
	        messageobj['txt'] = inMessage;
	        messageobj['id'] = fullJID;
	        messageobj['mid'] = mid;
	        messageobj['flags'] = 0;//0-sent;1-recieved
	        messageobj['state'] = 0;//0-sending;1-sent;2-Delivered;3-read
	        messageobj['isProductDetails'] = false;
	        messageobj['isCloseChatMesg'] = false;
	        messageobj['via'] = via ? via : '';
	        if(threadId){
	        	messageobj['threadId'] = threadId;
	    	}

		if (!("Notification" in window)) {
    			console.log("This browser does not support system notifications");
  		}else if (Notification.permission === "granted") {
   			 // If it's okay let's create a notification
    			var notification = new Notification(messageobj['sender']+' says '+messageobj['txt']);
  		}else if (Notification.permission !== 'denied') {
   			 Notification.requestPermission(function (permission) {
     			 // If the user accepts, let's create a notification
      			 	if (permission === "granted") {
        				var notification = new Notification(messageobj['sender']+' says '+messageobj['txt']);
    			 	}
    			 });
  		}
	        

	        if (receiverTigoId == $rootScope.tigoId){
	            otherpartyid = senderTigoId;
	        }
	        else{
	            otherpartyid = receiverTigoId;
	        }
	        if(isSpecialMessage){
	        	try{
	        		var specialMessage = JSON.parse(inMessage);
	        		if(specialMessage.PRDCNTXT){
		        		messageobj['isProductDetails'] = true;
		        		// Assigning ThreadId for a new chat
						if(!messageobj.threadId){
							messageobj['threadId'] = productObj.productId + "-" + guid();
						}
						var productObj ={};
						productObj.imageUrl = specialMessage.PRDCNTXT.image_url;
						productObj.description = specialMessage.PRDCNTXT.description;
						productObj.price = specialMessage.PRDCNTXT.price.replace("Rs" , "").trim();
						productObj.merchantId = specialMessage.PRDCNTXT.merchant_id;
						productObj.productId = specialMessage.PRDCNTXT.id;
						productObj.userId = specialMessage.PRDCNTXT.user_id;
						productObj.productUrl = specialMessage.PRDCNTXT.product_url;
						$rootScope.plustxtcacheobj.products[threadId] = productObj;

						
			        }
			        else if(specialMessage.CLSCHAT){
			        	messageobj['isCloseChatMesg'] = true;
			        }
	            }
	            catch(e){
	            }
	        }

	        if ($rootScope.plustxtcacheobj['contact'].hasOwnProperty(threadId))
	        {
	        	if(messageobj.isCloseChatMesg){
	        		$rootScope.plustxtcacheobj.contact[threadId].chatState = "closed";
	        	}
	        	if(messageobj.isProductDetails){
	        		$rootScope.plustxtcacheobj.contact[threadId].chatState = "open";
	        		$rootScope.plustxtcacheobj.contact[threadId].id = otherpartyid;
	        	}
	        	$rootScope.plustxtcacheobj.contact[threadId].lastActive = getTimeInLongString();
	        }
	        else {
	            $rootScope.usersCount = $rootScope.usersCount + 1;
	        	var contactObj = {};
	        	contactObj.name = "Guest " + $rootScope.usersCount;
	        	contactObj.id   = otherpartyid;
	        	contactObj.lastActive = getTimeInLongString();
	        	contactObj.chatState = "open";
	        	contactObj.threadId = messageobj.threadId;
	        	$rootScope.plustxtcacheobj['contact'][threadId] = contactObj;
	        } 



	        if ($rootScope.plustxtcacheobj['message'].hasOwnProperty(threadId))
	        {
	            messagelist = $rootScope.plustxtcacheobj['message'][threadId];
	            messagelist.push(messageobj)
	        }
	        else {
	            messagelist = [];
	            messagelist.push(messageobj);
	        }          
	        $rootScope.plustxtcacheobj['message'][threadId] = messagelist;
	        $rootScope.$broadcast("ChatObjectChanged", $rootScope.plustxtcacheobj);

	        if(messageobj.isProductDetails){
	        	var totalChats = getTotalActiveChatUsers();
	        	chatStarted($rootScope.sessionid, otherpartyid, totalChats, threadId);
	        }
	        if(messageobj.isCloseChatMesg){
	        	var totalChats = getTotalActiveChatUsers();
	        	chatClosed($rootScope.sessionid, otherpartyid, totalChats, threadId);
	        }

	    };

	    var getTotalActiveChatUsers = function(){
	    	var totalChats = 0;
	    	angular.forEach($rootScope.plustxtcacheobj.contact, function(value, index){
	    		if(value.chatState == "open"){
	    			totalChats++ ;
	    		}
	    	})
	    	return totalChats;
	    }

	    // Intimating Server about New Chat Begin
	    var chatStarted = function(sessionid, otherpartyid, totalChats, threadId){
	    	IntimationService.chatStarted.query({
				session_id : sessionid,
				c_user : otherpartyid,
				t_chats : totalChats,
				c_thread : threadId
			}, function success(response){
				console.log("Sucessfully Intimated Chat Start with : " + otherpartyid);		
			}, function failure(error){
				console.log("Error in Intimating Chat Start with : " + otherpartyid, error);	
			})
	    }

	    // Intimating Server about Chat being Closed
	    var chatClosed = function(sessionid, otherpartyid, totalChats, threadId){
	    	IntimationService.chatClosed.query({
				session_id : sessionid,
				c_user : otherpartyid,
				t_chats : getTotalActiveChatUsers(),
				c_thread : threadId
			}, function success(response){
				console.log("Sucessfully Intimated Chat End with : " + otherpartyid);		
			}, function failure(error){
				console.log("Error in Intimating Chat End with : " + otherpartyid, error);	
			})
	    }

		UtilService = {
			stringifyEmitUnicode : stringifyEmitUnicode,
      		getTimeInLongString: getTimeInLongString,
      		getMilliTimeToString : milliTimeToString,
      		getJidToId : jIdToId,
      		addMessage : addMessage,
      		syncHistory : syncHistory,
      		getAllPendingMessages : getAllPendingMessages,
      		updateMessageStatus : updateMessageStatus,
      		updateMessageStatusAsRead : updateMessageStatusAsRead,
      		getLocalTime : getLocalTime,
      		getTotalActiveChatUsers : getTotalActiveChatUsers,
      		chatStarted : chatStarted,
      		chatClosed : chatClosed
      	}

		return UtilService;
	}]);
})(angular);
