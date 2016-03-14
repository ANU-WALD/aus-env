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
    $scope.barLabels = [];
    $scope.barSeries = [];
    $scope.barData = [];

    $scope.pieData = [];
    $scope.pieLabels = [];
    var nationalSum = 0;
    var regionalSum = 0;

    $scope.createCharts = function(){
      if(!selection.regionType) {
        return;
        // Should this clear things instead???
      }

      var PlaceId = null;
      var label = null;
      if(selection.selectedRegion) {
        var keyField = selection.regionType.keyField;
        PlaceId = selection.selectedRegion.feature.properties[keyField];
        label = selection.selectedRegion.name;
      } else {
        PlaceId = 9999;
        label = 'National';
      }

      $scope.createBarChart(PlaceId,label);
      $scope.createLineChart(PlaceId,label);
      $scope.createPieChart(PlaceId,label);
    };

    $scope.$watch('selection.selectedRegion',$scope.createCharts);
    $scope.$watch('selection.selectedLayer',$scope.createCharts);
    $scope.$watch('selection.regionType',$scope.createCharts);

    $scope.selectBarChartData = function(newRegion){
      // Always called with newRegion undefined???
      $scope.barLabels = [];
      $scope.barSeries = [];
      $scope.barData = [];

//      $scope.pieData = [];
//      $scope.pieLabels = [];

      if(!newRegion) {
      } else {
        //$scope.selectedBarDataReion = $scope.barChartData[newRegion.name];
        try {
          $scope.barLabels = $scope.barChartData.columnNames;
          //$scope.barSeries.push('National');
          $scope.barSeries.push(newRegion.name);
          //$scope.barData.push($scope.barChartData.abc1);
          $scope.barData.push($scope.barChartData[newRegion.name]);

          //$scope.pieLabels.push("National");
          //$scope.pieLabels.push(newRegion.name);
          //nationalSum = $scope.barChartData.abc1.reduce(function(a, b) { return a + b; }, 0);
          //$scope.pieData.push(nationalSum);
          regionalSum = $scope.barChartData[newRegion.name].reduce(function(a, b) { return a + b; }, 0);
          //$scope.pieData.push(regionalSum);
        } catch(err) {
          console.log("Error:" + err + "," + " selection is undefined");
        }
      }
    };

    $scope.createBarChart = function(placeId,label){
      var summaryName = $scope.selection.selectedLayer[$scope.selection.dataMode].summary || $scope.selection.selectedLayer.summary;

      details.getBarChartData(summaryName, $scope.selection.regionType.source).then(function(data){
        $scope.barChartData = data;
        $scope.selectBarChartData($scope.selectedRegion); // I don't think this does anything - $scope.selectedRegion is undefined

        $scope.barLabels = [];
        $scope.barSeries = [];
        $scope.barData = [];

        $scope.barLabels = $scope.barChartData.columnNames;
        $scope.barSeries.push(label);
        var indexName = "PlaceIndex" + placeId;
        $scope.barData.push($scope.barChartData[indexName]);
      });

    };

    $scope.createPieChart = function(placeId,label) {
      var summaryName = $scope.selection.selectedLayer[$scope.selection.dataMode].summary || $scope.selection.selectedLayer.summary;

      details.getPieChartData(summaryName, $scope.selection.regionType.source,$scope.selection.year).then(function(data){
        console.log('Pie chart data',data);
        $scope.pieChartData = data;
        $scope.pieData = [];

        $scope.pieLabels = $scope.pieChartData.columnNames;
        var indexName = "PlaceIndex" + placeId;
        $scope.pieData = $scope.pieChartData[indexName]; // .push();
      });
    };

    //<editor-fold desc="pete linegraph">
    $scope.createLineChart = function(/*placeId,label*/){
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

    $scope.pieChartOptions = {
      animateRotate: false,
      animationSteps: 1
    };
  });
