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
    $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
    $scope.data = [300, 500, 100];

    details.getBarChartData('example','wetlands').then(function(data){
      $scope.barChartData = data;
      console.log($scope.barChartData);
      $scope.selectBarChartData($scope.selectedRegion);
    });

    $scope.selectBarChartData = function(newRegion){
      if(!newRegion) {
        // Treat it as national...
        $scope.selectedBarData = $scope.barChartData['national'];
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
    });
  });
