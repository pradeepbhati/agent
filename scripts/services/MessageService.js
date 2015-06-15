(function (angular) {
  'use strict';

  angular.module('bargain')
  .factory('MessageService', ['$compile', '$templateCache', '$http', '$q', function ($compile, $templateCache, $http, $q) {
    var expiryTime = 5000, messageBody, timer;

    function clearMessage() {
      if(messageBody){
        messageBody.remove();
      }

      if(timer){
        window.clearTimeout(timer);
      }
    }

    function displayMessage (message, cssClass){
      $http.get("partials/message-service/message.html", {cache: $templateCache})
      .success(function (response) {
        clearMessage();
        messageBody = $(response);
        messageBody.addClass(cssClass);
        messageBody.find(".message-text").text(message);
        messageBody.find(".button").click(clearMessage);
        timer = window.setTimeout(clearMessage, expiryTime);
        $("body").append(messageBody);
      });
    }

    return {
      displayInfo:function(message){
        displayMessage(message, "info");
      },

      displayError:function(message){
        displayMessage(message, "error");
      },

      displaySuccess:function(message){
        displayMessage(message, "success");
      },

      confirm:function(message, okText, cancelText){
        var deferred = $q.defer();
        $http.get("partials/message-service/confirmation.html", {cache: $templateCache})
        .success(function (response) {
          okText = okText || "Ok";
          cancelText = cancelText || "Cancel";
          clearMessage();
          messageBody = $(response);
          messageBody.find(".message-text").text(message);
          messageBody.find(".primaryButton").text(okText).click(function() {
            messageBody.remove();
            deferred.resolve();
          });
          messageBody.find(".secondaryButton").text(cancelText).click(function() {
            messageBody.remove();
            deferred.reject();
          });
          $(window.document).keyup(function(e){
            messageBody.remove();
            deferred.reject();
          });
          $("body").append(messageBody);
        });
        return deferred.promise;
      },

      responseHandler: function(data){
        // Security handling of the JSON response
        if (data != null && data.length > 0) {
          if (data.substr(0, 9) === "while(1);") {
            try {
              data = data.substring(9);
              data = (data) ? angular.fromJson(data) : null;
              if(data && data.statusCode === "2XX" && data.response){
                return data.response;
              }
              else{
                // dhtmlx.message({
                //   type:"error",
                //   text:'Unexpected Error',
                //   expire:expiryTime
                // });
              }
            }
            catch (ex) {

            }
          }
          else{
            return (data) ? angular.fromJson(data) : null;
          }
        }
        else {
          return data;
        }
      }
    }
  }]);
})(angular);
