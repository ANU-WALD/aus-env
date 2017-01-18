'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.configuration
 * @description
 * # configuration
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('configuration', function (staticData,$q) {
    var service = this;

    service.themes = staticData.deferredGet(service,'static/config/themes.json','_themes');

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
  });
