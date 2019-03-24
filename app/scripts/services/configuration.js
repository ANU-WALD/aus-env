'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.configuration
 * @description
 * # configuration
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('configuration', function (staticData,$q,environment) {
    var service = this;

    service.themes = staticData.deferredGet(service,environment.THEMES,'_themes');

    service.metadata = staticData.deferredGet(service,environment.LAYER_DETAILS,'_metadata');

    var DONT_PROPAGATE=['sublayers','menuOnly'];

    var configureSublayers = function(themes){
      themes.forEach(function(theme){
        theme.layers.forEach(function(layer){
          if(!layer.sublayers){
            return;
          }

          layer.sublayers.forEach(function(sl){
            for(var key in layer){
              if((DONT_PROPAGATE.indexOf(key)>-1)||sl[key]){
                continue;
              }

              sl[key] = layer[key];
            }
          });
        });
      });
    };

    var loadedQ = $q.defer();
    service.configurationLoaded = loadedQ.promise;
    service.themes().then(function(themes){
      configureSublayers(themes);

      loadedQ.resolve();
    });

    service.checkDataURISupport = function(){
      // Adapted from http://stackoverflow.com/a/36915691
      var result = $q.defer();
      try {
          var request = new XMLHttpRequest();
          request.onload = function reqListener() {
              result.resolve(true);
          };
          request.onerror = function reqListener() {
              result.resolve(false);
          };
          request.open('GET', 'data:application/pdf;base64,cw==');
          request.send();
      } catch (ex) {
          result.resolve(false);
      }
      return result.promise;
    };

  });
