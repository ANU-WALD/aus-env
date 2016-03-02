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

    try {
      details.getBarChartData($scope.selection.selectedLayer.summary, $scope.selection.regionType.source).then(function(data){
        // An object, rows of arrays, first rwo is national the rest rows identified by the name of the place
        console.log("selection");
        $scope.barChartData = data; 
        $scope.selectBarChartData($scope.selectedRegion);
      });
    } catch(err) {
      console.log("missing the csv data");
    }

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

        $scope.pieLabels.push("National");
        nationalSum = $scope.barChartData.national.reduce(function(a, b) { return a + b; }, 0);
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
        nationalSum = $scope.barChartData.national.reduce(function(a, b) { return a + b; }, 0);
        $scope.pieData.push(nationalSum); 
        regionalSum = $scope.barChartData[newRegion.name].reduce(function(a, b) { return a + b; }, 0);
        $scope.pieData.push(regionalSum); 
      }
    };

    $scope.$watch('selection.selectedRegion',function(newRegion){
      try {
        details.getBarChartData($scope.selection.selectedLayer.summary, $scope.selection.regionType.source).then(function(data){
          // An object, rows of arrays, first rwo is national the rest rows identified by the name of the place
          console.log("selection");
          $scope.barChartData = data; 
          $scope.selectBarChartData($scope.selectedRegion);
        });
      } catch(err) {
        console.log("missing the csv data");
      }

      console.log($scope.selection.selectedLayer.summary);
      console.log($scope.selection.regionType.source);
      $scope.barLabels = [];
      $scope.barSeries = [];
      $scope.barData = [];

      $scope.pieData = [];
      $scope.pieLabels = [];

      if(!$scope.barChartData) {
        return;
      }

      $scope.barLabels = $scope.barChartData.columnNames;
      console.log("barLabels");
      console.log($scope.barLabels);
      $scope.barSeries.push('National');
      $scope.barSeries.push(newRegion.name);
      $scope.barData.push($scope.barChartData.national);
      $scope.barData.push($scope.barChartData[newRegion.name]);

      $scope.pieLabels.push("National");
      $scope.pieLabels.push(newRegion.name);
      nationalSum = $scope.barChartData.national.reduce(function(a, b) { return a + b; }, 0);
      $scope.pieData.push(nationalSum); 
      regionalSum = $scope.barChartData[newRegion.name].reduce(function(a, b) { return a + b; }, 0);
      $scope.pieData.push(regionalSum); 
    });



  });
