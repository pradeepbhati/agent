(function (angular){
  'use strict';
  angular.module('bargain')
    .directive('promocodeCalculator', ['$timeout', function( $timeout) {
      return {
        restrict: 'EA',
        templateUrl: 'scripts/directives/promocode-calculator/promocode-calculator-template.html',
        scope: false,
        link: function(scope, element, attrs) {
          scope.discountPC = "";
          scope.discountABS = "";
          scope.discountType = "percentage"; 
          scope.$watch(function(){return scope.activeChatUser;}, function(value) {
            scope.product = scope.products[value];
          });

          scope.roundOff = function(value){
            return Math.round(value * 100) / 100;
          }
        }
      }
    }]);
})(angular);
