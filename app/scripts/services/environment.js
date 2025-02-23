'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.environment
 * @description
 * # environment
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('environment', function () {
    var service = this;

//    service.STATIC_CSV_SOURCE='/aucsv/accounts_June/';
    // service.THREDDS='https://dapds00.nci.org.au/thredds'
    service.THREDDS='https://thredds.nci.org.au/thredds'
    service.STATIC_CSV_SOURCE='/aucsv/accounts2/';
    service.REGION_AREAS='/aucsv/region_areas/';
    service.LANDCOVER_CODES='static/config/DLCD_codes.csv';
    service.LANDUSE_CODES='static/config/landuse_codes.csv';
    service.BY_LAND_TYPE_SUMMARY='clum1219';
    service.THEMES='static/config/themes.json';
    service.LAYER_DETAILS='static/config/additional_metadata.json';
    service.INTERPOLATION = {
      refDate:'12-31', //'06-30';
      timeWindow:''
    };

    service.bounds = {
      year:{
        min:2000,
        max:2024
      }
      // +++TODO Limit pan and zoom
    };
  });
