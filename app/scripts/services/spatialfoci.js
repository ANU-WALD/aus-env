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

    service.regionTypes = [
      {
        name:'Statistical Region',
        source:'SA1_2011_AUST'
      },
      {
        name:'IBRA',
        source:'ibra7_subresions'
      },
      {
        name:'NRM Regions',
        source:'statisticalRegions'
      },
      {
        name:'Catchments',
        source:'HR_Regions_river_region'
      },
      {
        name:'Ramsar Wetlands',
        source:'ramsar2015'
      },
      {
        name:'States and Territories',
        source:'statisticalRegions'
      },
      {
        name:'National Parks',
        source:'statisticalRegions'
      }
    ];

    service.regionTypes.forEach(function(rt){
      rt.jsonData = staticData.deferredGet(rt,'static/'+rt.source+'.json','_jsonData');
    });
  });
