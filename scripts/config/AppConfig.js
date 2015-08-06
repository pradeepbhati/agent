var Globals = {
  AppConfig : {}
};
(function() {
  var chatHostBaseURI = "http://local-agent.magictiger.com";
  Globals.AppConfig = {
  	ConcurrentChats : 3,
    MaxAgentUsers : 3,
  	ChatHostURI : 'dev-c.magictiger.com', //chatHostBaseURI.replace(/.*?:\/\//g, ""),
    ChatServerConnect :  chatHostBaseURI + "/accounts/connect/",
    StropheConnect : chatHostBaseURI  + "/http-bind/",
    GetConsumerMessagingInfo: "http://local-agent.magictiger.com/api/messaging/chatuser/:mobile/",
    CloseChatMessage : '{"CLSCHAT" : "chat closed"}',
    GetUserHistory : "http://local-agent.magictiger.com/api/messaging/messages/:mobile/",
    GetConsumerData : "http://local-agent.magictiger.com/api/accounts/consumer/:mobile/",
    DownloadMedia: "http://local-agent.magictiger.com/api/messaging/media/download/:multimediaId/",
    //GetUserHistory : "http://agent.magictiger.com/api/messaging/messages/",
    PanelLoginUrl: "http://local-agent.magictiger.com/api/accounts/agent/login/",
    PanelLogoutUrl: "http://local-agent.magictiger.com/api/accounts/agent/logout/",
    AgentChatCredentials: "http://local-agent.magictiger.com/api/messaging/chatuser/",
    PingCallback : "http://local-agent.magictiger.com/api/messaging/chatuser/pingback/",
    GenerateFoodForm: 'http://local-agent.magictiger.com/api/messaging/smartforms/smartform/',
    FoodFormUrl: 'http://dev-vendor.magictiger.com/food-menu/?form_id='
  }        
})();

