'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.timeseries
 * @description
 * # timeseries
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('timeseries', function ($window,$q,$http,selection) {
    var service = this;
    var dap = $window.dap;

    service.cache = {
      das:{},
      dds:{},
      ddx:{}
    };

    service.retrieveForPoint = function(pt,layer){

    };
  });
