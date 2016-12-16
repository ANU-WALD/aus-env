'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:ZoomCtrl
 * @description
 * # ZoomCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('ZoomCtrl', function ($scope,selection) {
    $scope.showSearch=false;
    $scope.selection = selection;

    $scope.mapZoom = function(delta) {
      selection.mapCentre.zoom += delta;
    };
  });
