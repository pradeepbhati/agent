(function (angular){
    "use strict;"

    angular.module('bargain').factory('ChatDSLService', [ '$rootScope', '$resource', 'ChatServerService', function($rootScope, $resouce, ChatServerService) {

	var ChatDSLService;

	var MT_CMMD = '_mt_cmmd';
	var MT_SPL_CLZZ = '00SPCLZZ';

	var gMapsUrl = "http://maps.google.com/maps?z=12&t=m&q=loc:";

	var getChatDSLMessage = function(msgObj){
	    var msg = msgObj.txt;
	    if(msg[0] == '{'){
		try{
		    var msgJson = JSON.parse(msg);
		    if(msgJson[MT_CMMD]){
			msgObj.mtJson = msgJson;
			return handleChatDSLMessage(msgObj);
		    }else if(msgJson[MT_SPL_CLZZ]){
			msgObj.mtSplClzz = msgJson;
			return handleChatSpecialMessage(msgObj);
		    }else{
			console.log(msgJson);
			console.log('misleading json');
			return msg;
		    }
		}catch(exception){
		    console.log(msgJson);
		    console.log('not a valid json');
		    return null;
		}
	    }
	};

	var handleChatSpecialMessage = function(msgObj) {
	    var msgJson = msgObj.mtSplClzz;
	    if(!msgJson){
		return null;
	    }
	    var chatSplMessage = msgJson[MT_SPL_CLZZ];
	    if(chatSplMessage['type']){
		switch(chatSplMessage['type']){
		case 'image':
		    msgObj.isImage = true;
		    msgObj.img = {};
		    msgObj.img.thumbnail = chatSplMessage['thumbnailUrl'];
		    msgObj.img.multimediaId = chatSplMessage['multimediaId'];
		    ChatServerService.downloadMedia($rootScope.user.token,msgObj.img.multimediaId).query({
			multimediaId : msgObj.img.multimediaId
		    }, function success(response){
			msgObj.img.url = response.media;
			console.log(response);
		    }, function failure(error){
			console.log(error);
		    });
		    break;
		case 'location':
		    msgObj.isLocation = true;
		    msgObj.loc = {};
		    msgObj.loc.lt = chatSplMessage.lt;
		    msgObj.loc.gt = chatSplMessage.gt;
		    msgObj.loc.thumbnail = chatSplMessage['thumbnailUrl'];
		    msgObj.loc.url = gMapsUrl + msgObj.loc.lt.toString() + '+' + msgObj.loc.gt.toString();
		    break;
		}
	    }
	    return null;
	}

	var handleChatDSLMessage = function(msgObj){
	    var msgJson = msgObj.mtJson;
	    if(!msgJson){
		return null;
	    }
	    var chatDSLJSON = msgJson[MT_CMMD];
	    if(chatDSLJSON['type']){
	       switch(chatDSLJSON['type']){
	       case 'ASSIGN':
		   msgObj.isSystemMessage=true;
		   msgObj.txt = chatDSLJSON['user'] + ' was assigned to ' + chatDSLJSON['agent'];
		   break;
	       case 'AGENT_CHAT_CLOSE':
		   msgObj.isSystemMessage=true;
		   msgObj.txt =  chatDSLJSON['user'] + ' closed conversation with ' + chatDSLJSON['agent'];
	       }
	    }
	    return null;
	};

	ChatDSLService = {
	    getChatDSLMessage: getChatDSLMessage,
	    handleChatDSLMessage: handleChatDSLMessage
	};

	return ChatDSLService;

    }]);
})(angular);
