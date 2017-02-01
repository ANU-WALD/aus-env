'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.mapmodes
 * @description
 * # mapmodes
 * Constant in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .constant('mapmodes', {
    grid:'Grid',
    region:'Region'
  });

angular.module('ausEnvApp')
  .constant('datamodes', {
    actual:'Actual',
    delta:'Change'
  });

angular.module('ausEnvApp')
  .constant('imagemodes', {
    transparent:'transparent',
    opaque:'Opaque'
  });



