var Globals = {
  AppConfig : {}
};
(function() {
  var chatHostBaseURI = "http://agent.magictiger.com";//"https://chat-staging.paytm.com";
  Globals.AppConfig = {
  	ConcurrentChats : 3,
  	ChatHostURI : '52.24.240.75', //chatHostBaseURI.replace(/.*?:\/\//g, ""),
    ChatServerConnect :  chatHostBaseURI + "/accounts/connect/",
    StropheConnect : chatHostBaseURI  + "/http-bind/",
    CloseChatMessage : '{"CLSCHAT" : "chat closed"}',
    GetUserHistory : "http://agent.magictiger.com/api/messaging/messages/get-messages/",
    //GetUserHistory : "http://agent.magictiger.com/api/messaging/messages/",
    PanelLoginUrl: "http://agent.magictiger.com/api/accounts/agent/login/",
    PanelLogoutUrl: "http://agent.magictiger.com/api/accounts/agent/logout/",
    AgentChatCredentials: "http://agent.magictiger.com/api/messaging/chatuser/"
  }        
})();

