'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.colourschemes
 * @description
 * # colourschemes
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('colourschemes', function () {
    var service = this;

    service.coloursFor = function(/*layer*/) {
      return [
        '#fff7ec',
        '#fee8c8',
        '#fdd49e',
        '#fdbb84',
        '#fc8d59',
        '#ef6548',
        '#d7301f',
        '#b30000',
        '#7f0000'
      ];
    };
  });
