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

    $scope.accordions={
      options:false
    };
    $scope.toggleSelectionMode = function(evt){
      evt.preventDefault();
      $scope.accordions.options=false;
      if(selection.selectionMode==='point'){
        selection.selectionMode='region';
      } else {
        selection.selectionMode='point';
      }
    };

    $scope.needAPoint = function(){
      return !$scope.noChartsAvailable()&&(selection.selectionMode==='region')&&!selection.selectedRegion;
    };

    $scope.needARegion = function(){
      return !$scope.noChartsAvailable()&&(selection.selectionMode==='point')&&!selection.selectedPoint;
    };

    $scope.noChartsAvailable = function(){
      return selection.selectedLayer&&(
        ((selection.selectionMode==='point')&&(selection.selectedLayer.disablePoint))||
        ((selection.selectionMode==='region')&&(selection.selectedLayer.disablePolygons))
      );
    };
  });
