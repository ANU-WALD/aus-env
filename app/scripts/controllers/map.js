'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('MapCtrl', function ($scope,selection) {
    $scope.selection = selection;

  });
