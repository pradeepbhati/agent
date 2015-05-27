var Globals = {
  AppConfig : {}
};
(function() {
  var chatHostBaseURI = "http://52.24.240.75";//"https://chat-staging.paytm.com";
  Globals.AppConfig = {
  	ConcurrentChats : 3,
  	ChatHostURI : '52.24.240.75', //chatHostBaseURI.replace(/.*?:\/\//g, ""),
    ChatServerConnect :  chatHostBaseURI + "/accounts/connect/",
    StropheConnect : chatHostBaseURI  + "/http-bind/",
    CloseChatMessage : '{"CLSCHAT" : "chat closed"}',
    GetUserHistory : "http://52.24.240.75/messages/get-messages/9591418090/"
  }        
})();
