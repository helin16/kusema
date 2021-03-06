'use strict';

var kusema = angular.module('kusema', [
'ngAnimate',
'ngRoute',
'kusema.config'
]);

kusema.config(function($routeProvider, $httpProvider) {
  
  $httpProvider.defaults.withCredentials = true;

  /* Direct unmatched urls */
  $routeProvider.otherwise({
    templateUrl: '404.html',
  });

  /* Direct urls */
  $routeProvider
  .when('/', {
    templateUrl: 'views/main.html'
  })
  .when('/question/:id', {
    templateUrl: 'views/question.html',
  });    
});

