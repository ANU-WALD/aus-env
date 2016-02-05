'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.themes
 * @description
 * # themes
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('themes', function () {
    var service = this;

    service.themes = [
      {
        name:'Tree Cover'
      },
      {
        name:'Inundation'
      },
      {
        name:'Ramsar Wetlands'
      },
      {
        name:'Gross Primary Productivity'
      }
    ]
  });
