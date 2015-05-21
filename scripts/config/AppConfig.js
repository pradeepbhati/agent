var Globals = {
  AppConfig : {}
};
(function() {
  var chatHostBaseURI = "http://104.131.98.86";//"https://chat-staging.paytm.com";
  Globals.AppConfig = {
  	ConcurrentChats : 3,
  	ChatHostURI : '104.131.98.86', //chatHostBaseURI.replace(/.*?:\/\//g, ""),
    ChatServerConnect :  chatHostBaseURI + "/accounts/connect/",
    StropheConnect : chatHostBaseURI  + "/http-bind/",
    CloseChatMessage : '{"CLSCHAT" : "chat closed"}'
  }        
})();
