'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.spatialFoci
 * @description
 * # spatialFoci
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('spatialFoci', function (staticData) {
    var service = this;

    service.regionTypes = staticData.deferredGet(service,'static/config/foci.json','_foci');

    service.regionTypes().then(function(regions){
      regions.forEach(function(rt){
        rt.jsonData = staticData.deferredGet(rt,'static/selection_layers/'+rt.source+'.json','_jsonData');
      });
    });
  });
