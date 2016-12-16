'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:LocationselectionCtrl
 * @description
 * # LocationselectionCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('LocationselectionCtrl', function ($scope,selection) {
    $scope.selection = selection;

    $scope.selectionType={
      tab: 0
    };

    $scope.selectionTypeTabSelected = function(idx){
      console.log(idx);
      selection.selectionMode = idx?'point':'region';
    };

    $scope.$watch('selection.selectionMode',function(){
      $scope.selectionType.tab = (selection.selectionMode==='region')?0:1;
    });
  });
