'use strict';

/**
 * @ngdoc overview
 * @name ausEnvApp
 * @description
 * # ausEnvApp
 *
 * Main module of the application.
 */
angular
  .module('ausEnvApp', [
    'ngAnimate',
    'ngAria',
    'ngResource',
    'ngRoute',
    'leaflet-directive',
    'ui.bootstrap',
    'ngTouch',
    'ng-static-data'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/headlines', {
        templateUrl: 'views/headlines.html',
        controller: 'HeadlinesCtrl',
        controllerAs: 'headlines'
      })
      .when('/search', {
        templateUrl: 'views/search.html',
        controller: 'HeadlinesCtrl',
        controllerAs: 'search'
      })
      .when('/details', {
        templateUrl: 'views/details.html',
        controller: 'DetailsCtrl',
        controllerAs: 'details'
      })
      .when('/map', {
        templateUrl: 'views/map.html',
        controller: 'MapCtrl',
        controllerAs: 'map'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
