'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:DetailsCtrl
 * @description
 * # DetailsCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('DetailsCtrl', function ($scope,selection,details) {
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

    $scope.barLabels = [];
    $scope.barData = [];

    details.getBarChartData('example','wetlands').then(function(data){
      $scope.barChartData = data;
      console.log($scope.barChartData);
      $scope.selectBarChartData($scope.selectedRegion);
    });

    $scope.selectBarChartData = function(newRegion){
      if(!newRegion) {
        // Treat it as national...
        $scope.selectedBarData = $scope.barChartData.national;
      } else {
        console.log(newRegion);
        $scope.selectedBarData = $scope.barChartData[newRegion.name];
      }
    };

    $scope.$watch('selection.selectedRegion',function(newRegion){
      if(!$scope.barChartData) {
        return;
      }

      $scope.selectBarChartData(newRegion);

      $scope.barLabels = [];
      $scope.barData = [];
      console.log("chin");
      console.log($scope.barChartData.columnNames);
      $scope.barLabels = $scope.barChartData.columnNames;
      console.log($scope.barLabels);
      $scope.barData.push($scope.selectedBarData);
      console.log($scope.barData);
    });



  });
