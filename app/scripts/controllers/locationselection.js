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
  });
