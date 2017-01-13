'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:ZoomCtrl
 * @description
 * # ZoomCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('ZoomCtrl', function ($scope,$uibModal,selection) {
    $scope.showSearch=false;
    $scope.selection = selection;

    $scope.$watch('selection.selectedLayer',function(){
      $scope.mapDescription = selection.selectedLayer.description;
    });

    $scope.mapZoom = function(delta) {
      selection.mapCentre.zoom += delta;
    };

    $scope.openShareModal = function(){
      var options = {
        animation:true,
        templateUrl: 'views/sharing.html',
        controller:'SharingCtrl',
        scope: $scope
      };

      $scope.modalInstance = $uibModal.open(options);
    };
  });
