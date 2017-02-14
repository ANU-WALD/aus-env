'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:ZoomCtrl
 * @description
 * # ZoomCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('ZoomCtrl', function ($scope,$uibModal,$timeout,selection) {
    $scope.showPopovers={
      search:false
    };
    $scope.selection = selection;

    $scope.$watch('selection.selectedLayer',function(){
      if(!selection.selectedLayer){
        return;
      }
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
        options.controller=ctrl;
      }


      $scope.modalInstance = $uibModal.open(options);
    };

    $scope.openShareModal = function(){
      $scope.showModal('sharing','SharingCtrl');
    };

    $scope.openSearchModal = function(){
      $scope.showPopovers.search=false;
      $scope.showModal('maptools/search');
    };

    $scope.closeModal = function(){
      if($scope.modalInstance){
        $scope.modalInstance.dismiss();
      }

      $scope.modalInstance=null;
    };

    $scope.hideSearch = function(){
      console.log('here');
      $scope.showPopovers.search='closing';
      $timeout(function(){
        if($scope.showPopovers.search==='closing'){
          $scope.showPopovers.search=false;
        }
      },500);
    };

    $scope.searchByRegion = function(){
      $scope.searchMode=0;
      $scope.openSearchModal();
    };

    $scope.searchByLatLon = function(){
      $scope.searchMode=1;
      $scope.openSearchModal();
    };

    $scope.searchByLocation = function(){
      $scope.searchMode=2;
      $scope.openSearchModal();
    };

    $scope.showTour = function(){
      $scope.selection.showHelp=true;
    };
  });
