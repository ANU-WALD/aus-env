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
    service._jsonData = {};

    service.regionTypes = staticData.deferredGet(service,'static/config/foci.json','_foci');

    service.regionTypes().then(function(regions){
      regions.forEach(function(rt){
        if(rt.source){
          rt.jsonData = staticData.deferredGet(service._jsonData,'static/selection_layers/'+rt.source+'.json',rt.source);
        }
      });
    });

    service.show = function(regionType){
      return regionType && regionType.jsonData && !regionType.hide;
    };
  });
