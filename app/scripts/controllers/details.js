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

    $scope.barChartData = 0;
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
      console.log("chin selection");
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

        try {
          $scope.barLabels = $scope.barChartData.columnNames;
          $scope.barSeries.push('National');
          $scope.barData.push($scope.barChartData.abc1);

          $scope.pieLabels.push("National");
          nationalSum = $scope.barChartData.abc1.reduce(function(a, b) { return a + b; }, 0);
          $scope.pieData.push(nationalSum);
        } catch(err) {
          console.log("Error: " + err + "," + " selection is undefined");
        }
      } else {
        //$scope.selectedBarDataReion = $scope.barChartData[newRegion.name];
        try {
          $scope.barLabels = $scope.barChartData.columnNames;
          //$scope.barSeries.push('National');
          $scope.barSeries.push(newRegion.name);
          //$scope.barData.push($scope.barChartData.abc1);
          $scope.barData.push($scope.barChartData[newRegion.name]);

          //$scope.pieLabels.push("National");
          $scope.pieLabels.push(newRegion.name);
          //nationalSum = $scope.barChartData.abc1.reduce(function(a, b) { return a + b; }, 0);
          //$scope.pieData.push(nationalSum);
          regionalSum = $scope.barChartData[newRegion.name].reduce(function(a, b) { return a + b; }, 0);
          $scope.pieData.push(regionalSum);
        } catch(err) {
          console.log("Error:" + err + "," + " selection is undefined");
        }
      }
    };

    $scope.$watch('selection.selectedRegion',function(newRegion){
      try {
        details.getBarChartData($scope.selection.selectedLayer.summary, $scope.selection.regionType.source).then(function(data){
          // An object, rows of arrays, first rwo is national the rest rows identified by the name of the place
          console.log("second selection");
          $scope.barChartData = data;
          $scope.selectBarChartData($scope.selectedRegion);

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
          //$scope.barSeries.push('National');
          console.log("region name: " + newRegion.name);
          $scope.barSeries.push(newRegion.name);
          //$scope.barData.push($scope.barChartData.abc1);
          $scope.barData.push($scope.barChartData[newRegion.name]);

          $scope.pieLabels.push("National");
          //$scope.pieLabels.push(newRegion.name);
          //nationalSum = $scope.barChartData.abc1.reduce(function(a, b) { return a + b; }, 0);
          //$scope.pieData.push(nationalSum);
          regionalSum = $scope.barChartData[newRegion.name].reduce(function(a, b) { return a + b; }, 0);
          $scope.pieData.push(regionalSum);
        });
      } catch(err) {
        console.log("second missing the csv data");
      }


    });


    //<editor-fold desc="pete linegraph">
    console.log("Trying a line graph");
    $scope.lineLabels = details.makeSimpleLabels(10);
    $scope.lineSeries = ['one','two'];
    $scope.lineData = [];
    $scope.lineData.push(details.randomDataArray(10));
    $scope.lineData.push(details.randomDataArray(10));
    $scope.lineOptions = {

      ///Boolean - Whether grid lines are shown across the chart
      scaleShowGridLines : true,

      //String - Colour of the grid lines
      scaleGridLineColor : "rgba(0,0,0,.05)",

      //Number - Width of the grid lines
      scaleGridLineWidth : 1,

      //Boolean - Whether to show horizontal lines (except X axis)
      scaleShowHorizontalLines: true,

      //Boolean - Whether to show vertical lines (except Y axis)
      scaleShowVerticalLines: true,

      //Boolean - Whether the line is curved between points
      bezierCurve : false,  //true

      //Number - Tension of the bezier curve between points
      bezierCurveTension : 0.4,

      //Boolean - Whether to show a dot for each point
      pointDot : false,  //true

      //Number - Radius of each point dot in pixels
      pointDotRadius : 4,

      //Number - Pixel width of point dot stroke
      pointDotStrokeWidth : 1,

      //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
      pointHitDetectionRadius : 20,

      //Boolean - Whether to show a stroke for datasets
      datasetStroke : true,

      //Number - Pixel width of dataset stroke
      datasetStrokeWidth : 2,

      //Boolean - Whether to fill the dataset with a colour
      datasetFill : true,

      //String - A legend template
      //legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

    };

    $scope.onLineClick = function (points, evt) {
      console.log(points, evt);
    };

    $scope.$on('create', function (event, chart) {  //how to limit to just line graph?
      console.log("create");
      console.log(chart);
    });

    $scope.$on('update', function (event, chart) {  //how to limit to just line graph?
      console.log("update");
      console.log(chart);
    });
    //</editor-fold>

  });
