'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.selection
 * @description
 * # selection
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('selection', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var service = this;

    service.year = 2015;
    service.theme = 'Tree Cover';
    service.themeObject = null;
    service.mapMode = 'Grid';
    service.regionType = null;
    service.regionName = null;

  });
