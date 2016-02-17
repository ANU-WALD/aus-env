'use strict';


/**
 * @ngdoc function
 * @name ausEnvApp.controller:DetailsCtrl
 * @description
 * # DetailsCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('DetailsCtrl', function ($scope,selection) {
    $scope.selection = selection;
    $scope.viewOptions = [
      {
        style:'bar',
        icon:'fa-bar-chart'
      },
      {
        style:'pie',
        icon:'fa-pie-chart', 
      },
      {
        style:'timeseries',
        icon:'fa-line-chart'
      }
    ];

  });





