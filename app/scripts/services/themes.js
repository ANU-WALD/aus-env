'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.themes
 * @description
 * # themes
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('themes', function (staticData,selection) {
    var service = this;

    service.themes = staticData.deferredGet(service,'static/config/themes.json','_themes');

    service.colourRange = function(layer) {
      if(layer[selection.dataMode]) {
        return layer[selection.dataMode].colorscalerange || layer.colorscalerange;
      } else {
        return layer.colorscalerange;
      }
    };
  });
