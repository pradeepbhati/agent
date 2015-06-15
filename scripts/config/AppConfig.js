var Globals = {
  AppConfig : {}
};
(function() {
  var chatHostBaseURI = "http://dev-agent.magictiger.com";//"https://chat-staging.paytm.com";
  Globals.AppConfig = {
  	ConcurrentChats : 3,
    MaxAgentUsers : 3,
  	ChatHostURI : '52.11.221.95', //chatHostBaseURI.replace(/.*?:\/\//g, ""),
    ChatServerConnect :  chatHostBaseURI + "/accounts/connect/",
    StropheConnect : chatHostBaseURI  + "/http-bind/",
    CloseChatMessage : '{"CLSCHAT" : "chat closed"}',
    GetUserHistory : "http://dev-agent.magictiger.com/api/messaging/messages/get-messages/",
    GetConsumerData : "http://dev-agent.magictiger.com/api/accounts/consumer/:mobile/",
    //GetUserHistory : "http://agent.magictiger.com/api/messaging/messages/",
    PanelLoginUrl: "http://dev-agent.magictiger.com/api/accounts/agent/login/",
    PanelLogoutUrl: "http://dev-agent.magictiger.com/api/accounts/agent/logout/",
    AgentChatCredentials: "http://dev-agent.magictiger.com/api/messaging/chatuser/",
    PingCallback : "http://dev-agent.magictiger.com/api/messaging/chatuser/pingback/"
  }        
})();

