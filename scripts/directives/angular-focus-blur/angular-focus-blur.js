(function (angular){
  'use strict';
    angular.module('bargain').directive('ngFocus', ['$parse', function($parse) {
	    return function(scope, element, attr) {
	        var fn = $parse(attr['ngFocus']);
	        element.on('focus', function(event) {
	            scope.$apply(function() {
	                fn(scope, {$event:event});
	            });
	        });
	    };
	}]);

	angular.module('bargain').directive('ngBlur', ['$parse', function($parse) {
	    return function(scope, element, attr) {
	        var fn = $parse(attr['ngBlur']);
	        element.on('blur', function(event) {
	            scope.$apply(function() {
	                fn(scope, {$event:event});
	            });
	        });
	    };
	}]);
})(angular);