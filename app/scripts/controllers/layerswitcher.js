'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:LayerswitcherCtrl
 * @description
 * # LayerswitcherCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('LayerswitcherCtrl', function ($scope,selection) {
    $scope.selection = selection;

    $scope.updatedSelectedLayer = function(title){
      $scope.selection.selectedLayer =
        $scope.selection.themeObject.layers.find(function(l){
          return l.title===title;
        })
    };
  });
