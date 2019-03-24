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

    service.STATIC_CSV_SOURCE='/aucsv/accounts/';
    service.REGION_AREAS='/aucsv/region_areas/';
    service.LANDCOVER_CODES='static/config/DLCD_codes.csv';
    service.LANDUSE_CODES='static/config/landuse_codes.csv';
    service.BY_LAND_TYPE_SUMMARY='DLCD';
    service.THEMES='static/config/themes.json';
    service.LAYER_DETAILS='static/config/additional_metadata.json';
  });
