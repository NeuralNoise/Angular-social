'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', ['ngRoute','myApp.login','myApp.home','myApp.version']);

/* Factories */

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/login', {
        templateUrl: 'partials/login/login.html',
        controller: 'loginCtrl'
    })
    .when('/home', {
        templateUrl: 'partials/home/home.html',
        controller: 'homeCtrl'
    })
    .otherwise({
        redirectTo: '/login'
    });
}]);

app.factory('sessionService', ['$http', function($http){
    return{
        set:function(key,value){
            return sessionStorage.setItem(key,value);
        },
        get:function(key){
            return sessionStorage.getItem(key);
        },
        destroy:function(key){
            $http.post('data/destroy_session.php');
            return sessionStorage.removeItem(key);
        }
    };
}]);

app.factory('Data', ['$http',function ($http, toaster) { 
// This service connects to our REST API
        var serviceBase = 'api/v1/';

        var obj = {};
         obj.toast = function (data) {
            toastr.success(data.status, data.message);
        }
        obj.get = function (q) {
            return $http.get(serviceBase + q).then(function (results) {
                return results.data;
            });
        };
        obj.post = function (q, object) {
            return $http.post(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        obj.put = function (q, object) {
            return $http.put(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        obj.delete = function (q) {
            return $http.delete(serviceBase + q).then(function (results) {
                return results.data;
            });
        };

        return obj;
}]);

app.factory('loginService',function ($http, $location, sessionService){
    return{
        login:function(data,scope){
            
            var $promise=$http.post('data/login.php',data); //send data to user.php

            $promise.then(function(msg){
                var uid = msg.data;

                if(uid){
                  
                    scope.msgtxt='Correct information';
                    console.log(scope.msgtxt);
                    sessionService.set('uid',uid);
                    $location.path('/home');
                    toastr.success('Welcome','Login successful');
                }          
                else  {
                    scope.msgtxt='incorrect information';
                    console.log(scope.msgtxt);
                    toastr.error('Did you forget?', 'Incorrect user information');
                    $location.path('/login');
                }                  
            });
        },
        logout:function(){
            sessionService.destroy('uid');
            $location.path('/login');
            toastr.info('','Logout successful');
        },
        islogged:function(){
            var $checkSessionServer=$http.post('data/check_session.php');
            return $checkSessionServer;
            /*
            if(sessionService.get('user')) return true;
            else return false;
            */
        }
    }

});

app.factory('signupService',function($http, $location, sessionService){
    return{
        signup:function(data,scope){
            var $promise=$http.post('data/adduser.php',data); //send data to adduser.php

            $promise.then(function(msg){
                var uid = msg.data;
                console.log(uid);
                if(uid){
                    scope.msgtxt='Done';
                    console.log(scope.msgtxt);
                    sessionService.set('uid',uid);
                    $location.path('/home');
                    toastr.success('Welcome','Success');
                }          
                else  {
                    scope.msgtxt='Already exists';
                    console.log(scope.msgtxt);
                    toastr.error('Error', 'User already exists');
                    $location.path('/login');
                }                  
            });
        }
    }

});

app.run(function($rootScope, $location, loginService){
    var routelogin=['/home'];  //route that require login
    var routelogged=['/login'];  //route that require logged out

    $rootScope.$on('$routeChangeStart', function(){
        if( routelogin.indexOf($location.path()) !=-1)
        {
            var connected=loginService.islogged();
            connected.then(function(msg){
                if(!msg.data) $location.path('/login');
            });
        }

        if( routelogged.indexOf($location.path()) !=-1)
        {
            var connected=loginService.islogged();
            connected.then(function(msg){
                if(msg.data) $location.path('/home');
            });
        }
    });

});

