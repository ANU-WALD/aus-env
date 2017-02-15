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

// startsWith polyfil
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position){
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}
// Array.find polyfil for IE
//if (!Array.prototype.find) {
//  Array.prototype.find = function(predicate) {
//    if (this === null) {
//      throw new TypeError('Array.prototype.find called on null or undefined');
//    }
//    if (typeof predicate !== 'function') {
//      throw new TypeError('predicate must be a function');
//    }
//    var list = Object(this);
//    var length = list.length >>> 0;
//    var thisArg = arguments[1];
//    var value;
//
//    for (var i = 0; i < length; i++) {
//      value = list[i];
//      if (predicate.call(thisArg, value, i, list)) {
//        return value;
//      }
//    }
//    return undefined;
//  };
//}
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
    'ui.bootstrap',
    'ngTouch',
    'ng-static-data',
    'chart.js',
    'angularScreenfull',
    'ui.select',
    'uiGmapgoogle-maps'
  ])
  .config(function ($routeProvider,$logProvider,uiGmapGoogleMapApiProvider,$compileProvider){
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|data):/);

    var key='WENFO_GOOGLE_MAPS_API_KEY';
    var libs = 'geometry,visualization';
    if(key.indexOf('WENFO')===0){
      uiGmapGoogleMapApiProvider.configure({
        libraries: libs
      });
    } else {
      uiGmapGoogleMapApiProvider.configure({
        key:key,
        libraries: libs
      });
    }

    var urlComponents=[
      'year','selectedLayer','mapMode','dataMode','regionType','selectedDetailsView',
      'latitude','longitude','zoom','selectedRegion','mapType','imageMode'
    ];
    var templateUrl = '/'+urlComponents.map(function(c){return ':'+c+'?';}).join('/');
    $routeProvider
      .when(templateUrl, {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/'
      });
    $logProvider.debugEnabled(false);
  });
