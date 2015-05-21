(function (angular) {
    'use strict;'

    angular.module('bargain').factory("httpService", ['$http', '$rootScope', '$q', 
        function ($http, $rootScope, $q) {
            var SignupService = function (url) {
                var self = this;
                self.url = url;
                self.get = function (params) {
                    var deferred = $q.defer();
                    $http.get(self.url, {params: params}).success(function (data) {
                        deferred.resolve(data);
                    }).error(function (data) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                };
                self.post = function (params) {
                    self.params = params;
                    var deferred = $q.defer();
                    var config = {
                        headers: {
                            'Content-type': 'application/json'
                        },
                        'dataType': 'json',
                        withCredentials: true
                    };

                    $http.post(self.url, params, config).success(function (data) {
                        deferred.resolve(data);
                    }).error(function (data) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                };
                self.update = function (params) {
                    var deferred = $q.defer();
                    self.params = params;
                    $http.put(self.url, params).success(function (data) {
                        deferred.resolve(data);
                    }).error(function (data) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                };
                self.delete = function (params) {
                    var deferred = $q.defer();
                    self.params = params;
                    $http['delete'](self.url, params).success(function (data) {
                        deferred.resolve(data);
                    }).error(function (data) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                };
            };
            var svc = {
                callFunc: function (url) {
                    if (!url) {
                        return false;
                    }
                    return new SignupService(url);
                }
            }
            return svc;
}]);

})(angular);