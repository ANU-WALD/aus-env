'use strict';

/* jshint ignore:start */
if (typeof Function.prototype.bind !== 'function') {
    Function.prototype.bind = function bind(obj) {
        var args = Array.prototype.slice.call(arguments, 1),
            self = this,
            nop = function() {
            },
            bound = function() {
                return self.apply(
                    this instanceof nop ? this : (obj || {}), args.concat(
                        Array.prototype.slice.call(arguments)
                    )
                );
            };
        nop.prototype = this.prototype || {};

        bound.prototype = new nop();
        return bound;
    };
}

// Math.log10 polyfil for IE
Math.log10 = Math.log10 || function(x) {
    return Math.log(x) / Math.LN10;
  };

// Array.find polyfil for IE
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

// startsWith polyfil
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position){
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

/* jshint ignore:end */

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
    'ngSanitize',
    'leaflet-directive',
    'ui.bootstrap',
    'ngTouch',
    'ng-static-data',
    'chart.js',
    'angularScreenfull'
  ])
  .config(function ($routeProvider,$logProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
//      .when('/about', {
//        templateUrl: 'views/about.html',
//        controller: 'AboutCtrl',
//        controllerAs: 'about'
//      })
//      .when('/headlines', {
//        templateUrl: 'views/headlines.html',
//        controller: 'HeadlinesCtrl',
//        controllerAs: 'headlines'
//      })
//      .when('/search', {
//        templateUrl: 'views/search.html',
//        controller: 'HeadlinesCtrl',
//        controllerAs: 'search'
//      })
//      .when('/details', {
//        templateUrl: 'views/details.html',
//        controller: 'DetailsCtrl',
//        controllerAs: 'details'
//      })
//      .when('/map', {
//        templateUrl: 'views/map.html',
//        controller: 'MapCtrl',
//        controllerAs: 'map'
//      })
//      .when('/debug', {
//        templateUrl: 'views/debug.html',
//        controller: 'DebugCtrl',
//        controllerAs: 'debugger'
//      })
      .otherwise({
        redirectTo: '/'
      });
    $logProvider.debugEnabled(false);
  });
