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
    delta:'Change',
    rank:'Rank'
  });

angular.module('ausEnvApp')
  .constant('imagemodes', {
    transparent:'transparent',
    opaque:'Opaque'
  });


angular.module('ausEnvApp')
  .constant('backgroundmodes', {
    roadmap:'Roadmap',
    satellite:'Satellite',
    white:'White',
    black:'Black'
  });

