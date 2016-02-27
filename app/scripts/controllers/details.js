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

    // Define the empty chart
    $scope.barLabels = [];
    $scope.barSeries = [];
    $scope.barData = [];

    $scope.pieData = [];
    $scope.pieLabels = [];
    var nationalSum = 0;
    var regionalSum = 0;

    details.getBarChartData('example','wetlands').then(function(data){
      // An object, rows of arrays, first rwo is nationalthen identified by the name of the place
      $scope.barChartData = data; 
      $scope.selectBarChartData($scope.selectedRegion);
    });

    $scope.selectBarChartData = function(newRegion){
      // Empty the previous barchart
      $scope.barLabels = [];
      $scope.barSeries = [];
      $scope.barData = [];

      $scope.pieData = [];
      $scope.pieLabels = [];

      if(!newRegion) {
        // Treat it as national...
        //$scope.selectedBarDataNational = $scope.barChartData.national;
        $scope.barLabels = $scope.barChartData.columnNames;
        $scope.barSeries.push('National');
        $scope.barData.push($scope.barChartData.national);

        /*
        $scope.pieLabels.push("Download Sales");
        $scope.pieData = [300];
        */

        $scope.pieLabels.push("National");
        nationalSum = $scope.barChartData.national.reduce((chin, liu) => chin + liu, 0);
        $scope.pieData.push(nationalSum); 

      } else {
        //$scope.selectedBarDataReion = $scope.barChartData[newRegion.name];
        $scope.barLabels = $scope.barChartData.columnNames;
        $scope.barSeries.push('National');
        $scope.barSeries.push(newRegion.name);
        $scope.barData.push($scope.barChartData.national);
        $scope.barData.push($scope.barChartData[newRegion.name]);

        $scope.pieLabels.push("National");
        $scope.pieLabels.push(newRegion.name);
        nationalSum = $scope.barChartData.national.reduce((chin, liu) => chin + liu, 0);
        $scope.pieData.push(nationalSum); 
        regionalSum = $scope.barChartData[newRegion.name].reduce((chin, liu) => chin + liu, 0);
        $scope.pieData.push(regionalSum); 

      }
    };

    $scope.$watch('selection.selectedRegion',function(newRegion){
      // Empty the previous barchart
      $scope.barLabels = [];
      $scope.barSeries = [];
      $scope.barData = [];

      $scope.pieData = [];
      $scope.pieLabels = [];

      if(!$scope.barChartData) {
        return;
      }

      $scope.barLabels = $scope.barChartData.columnNames;
      $scope.barSeries.push('National');
      $scope.barSeries.push(newRegion.name);
      $scope.barData.push($scope.barChartData.national);
      $scope.barData.push($scope.barChartData[newRegion.name]);

      $scope.pieLabels.push("National");
      $scope.pieLabels.push(newRegion.name);
      nationalSum = $scope.barChartData.national.reduce((chin, liu) => chin + liu, 0);
      $scope.pieData.push(nationalSum); 
      regionalSum = $scope.barChartData[newRegion.name].reduce((chin, liu) => chin + liu, 0);
      $scope.pieData.push(regionalSum); 
    });



  });
