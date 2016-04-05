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

  var first_year = 2000;

  var currentYearIndex = selection.year - first_year;
  console.log("current year");
  console.log(currentYearIndex);
  $scope.barOptions =  {
      // Sets the chart to be responsive
      responsive: true,

      //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
      scaleBeginAtZero : true,

      //Boolean - Whether grid lines are shown across the chart
      scaleShowGridLines : true,

      //String - Colour of the grid lines
      scaleGridLineColor : "rgba(0,0,0,.05)",

      //Number - Width of the grid lines
      scaleGridLineWidth : 1,

      //Boolean - If there is a stroke on each bar
      barShowStroke : true,

      //Number - Pixel width of the bar stroke
      barStrokeWidth : 0,

      //Number - Spacing between each of the X value sets
      barValueSpacing : 0,

      //Number - Spacing between data sets within X values
      barDatasetSpacing : 1,
    };

    /*
    $scope.barColors = [{
      fillColor: 'rgba(247,70,74,0.2)',
      strokeColor: 'rgba(247,70,74,1)',
      pointColor: 'rgba(247,70,74,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(247,70,74,0.8)'
    }];
    */

    $scope.barColors = [{fillColor:["#66987F"]}];
    $scope.barColors[0].fillColor[currentYearIndex] = "#2B5F45";

    $scope.selection = selection;
    $scope.viewOptions = [
      {
        style:'bar',
        icon:'fa-bar-chart', 
        description: ''
      },
      {
        style:'pie',
        icon:'fa-pie-chart', 
        description: ''
      },
      {
        style:'timeseries',
        icon:'fa-line-chart', 
        description: ''
      }
    ];

    $scope.bar = {
      title:null,
      description:null,
      units: null
    };

    $scope.pie = {
      title:null,
      description:null,
      units: null
    };

    $scope.barChartData = 0;
    $scope.barLabels = [];
    $scope.barSeries = [];
    $scope.barData = [];

    $scope.pieData = [];
    $scope.pieLabels = [];

    $scope.clearData = function(){
      $scope.barChartData = 0;
      $scope.barLabels = [];
      $scope.barSeries = [];
      $scope.barData = [];

      $scope.pieData = [];
      $scope.pieLabels = [];
    };

    $scope.createCharts = function(){
      if(!selection.selectedLayer || !selection.regionType) {
        $scope.clearData();
        return;
      }

      var PlaceId = null;
      var label = null;
      if(selection.selectedRegion && selection.selectedRegion.name) {
        var keyField = selection.regionType.keyField;
        PlaceId = selection.selectedRegion.feature.properties[keyField];
        label = selection.selectedRegion.name;
      } else if(!selection.haveRegion()){
        PlaceId = 9999;
        label = 'National';
      } else {
        return;
      }

      $scope.createBarChart(PlaceId,label);
      $scope.createPieChart(PlaceId);
//      $scope.createLineChart(PlaceId,label);
    };

    $scope.$watch('selection.selectedRegion',$scope.createCharts);
    $scope.$watch('selection.selectedLayer',$scope.createCharts);
    $scope.$watch('selection.regionType',$scope.createCharts);

    $scope.populateLabels = function(chart,data){
        chart.title = data.Title;
        chart.description = data.Description;
        chart.units = data.Units;
        if(chart === $scope.bar) {
          $scope.viewOptions[0].description = chart.description;
        } else if(chart === $scope.pie) {
          $scope.viewOptions[1].description = chart.description;
        }
    };

    $scope.createBarChart = function(placeId,label){
      details.getBarChartData().then(function(data){
        $scope.barChartData = data;
        $scope.units = $scope.barChartData.Units;
        $scope.barLabels = [];
        $scope.barSeries = [];
        $scope.barData = [];
        $scope.populateLabels($scope.bar,data);
        $scope.barLabels = $scope.barChartData.columnNames;
        $scope.barSeries.push(label);
        var indexName = "PlaceIndex" + placeId;
        $scope.barData.push($scope.barChartData[indexName]);
        console.log("what is the column like is here");
        console.log($scope.barData);
      });
    };

    $scope.createPieChart = function(placeId) {
      details.getPieChartData().then(function(data){
        $scope.pieChartData = data;
        $scope.pieData = [];
        $scope.populateLabels($scope.pie,data);

        $scope.pieLabels = $scope.pieChartData.columnNames.map(function(column){
          return $scope.pieChartData.columnPresentation[column].Class_Name;
        });

        var indexName = "PlaceIndex" + placeId;
        $scope.pieData = $scope.pieChartData[indexName];
        $scope.pieChartColours = $scope.pieChartData.columnNames.map(function(col){
          var presentation = $scope.pieChartData.columnPresentation[col];
          return 'rgb('+presentation.Red+','+presentation.Green+','+presentation.Blue+')';
        });
//        $scope.pieData = $scope.pieChartData[indexName].map(function(value,idx){
//          var col = $scope.pieChartData.columnNames[idx];
//          var presentation = $scope.pieChartData.columnPresentation[col];
//          return {
//            value: value,
//            color: 'rgb('+presentation.Red+','+presentation.Green+','+presentation.Blue+')',
//            label: presentation.Class_Name
//          };
//        });
      });
    };

    //<editor-fold desc="pete linegraph">
    $scope.createLineChart = function(/*placeId,label*/){
//      console.log("Trying a line graph");
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
