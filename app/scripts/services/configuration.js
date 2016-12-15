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

    var loadedQ = $q.defer();
    service.configurationLoaded = loadedQ.promise;
    $q.all([service.themes()]).then(function(){
      loadedQ.resolve();
    });
  });
