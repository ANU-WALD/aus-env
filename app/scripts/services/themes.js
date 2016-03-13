'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.themes
 * @description
 * # themes
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('themes', function (staticData) {
    var service = this;

    service.themes = staticData.deferredGet(service,'static/config/themes.json','_themes');

  });
