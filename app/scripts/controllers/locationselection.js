'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:LocationselectionCtrl
 * @description
 * # LocationselectionCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('LocationselectionCtrl', function ($scope,$log,selection) {
    $scope.selection = selection;

    $log.log('Redundant controller, LocationselectionCtrl');
    // Redundant?
  });
