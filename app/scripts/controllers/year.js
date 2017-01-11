'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:YearCtrl
 * @description
 * # YearCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('YearCtrl', function ($scope,selection) {
    $scope.selection = selection;

    $scope.moveYear = function(evt,dir){
      evt.preventDefault();
      $scope.selection.moveYear(dir);
    };
  });
