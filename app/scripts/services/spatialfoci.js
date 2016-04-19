'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.spatialFoci
 * @description
 * # spatialFoci
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('spatialFoci', function (staticData,selection) {
    var service = this;
    service._jsonData = {};

    service.regionTypes = staticData.deferredGet(service,'static/config/foci.json','_foci');

    service.regionTypes().then(function(regions){
      regions.forEach(function(rt){
        rt.jsonData = staticData.deferredGet(service._jsonData,'static/selection_layers/'+rt.source+'.json',rt.source);
      });
      selection.regionType = regions[0];
      selection.initialisePolygons(regions[0]);
    });
  });
