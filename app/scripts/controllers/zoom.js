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

    $scope.showModal = function(view,ctrl){
      $scope.closeModal();
      var options = {
        animation:true,
        templateUrl: 'views/'+view+'.html',
        scope: $scope
      };

      if(ctrl){
        $scope.controller=ctrl;
      }

      $scope.modalInstance = $uibModal.open(options);
    };

    $scope.openShareModal = function(){
      $scope.showModal('sharing','SharingCtrl');
    };

    $scope.openSearchModal = function(){
      $scope.showModal('maptools/search');
    };

    $scope.closeModal = function(){
      if($scope.modalInstance){
        $scope.modalInstance.dismiss();
      }

      $scope.modalInstance=null;
    };
  });
