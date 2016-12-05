'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:MapdisplayCtrl
 * @description
 * # MapdisplayCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('MapdisplayCtrl', function ($scope,staticData,mapmodes,selection,spatialFoci) {
    $scope.mapmodes = mapmodes;
    $scope.selection = selection;
    staticData.unwrap($scope,'options',spatialFoci.regionTypes);

    $scope.regionTypeChanged = function(newOption) {
      if(!spatialFoci.show(newOption)){
        selection.mapMode = mapmodes.grid;
      }
      selection.initialisePolygons(newOption);
    };
  });
