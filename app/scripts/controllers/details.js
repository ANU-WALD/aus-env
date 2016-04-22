'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:DetailsCtrl
 * @description
 * # DetailsCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .config(['ChartJsProvider', function (ChartJsProvider) {

    /*
    window.onload = function() {
      console.log(document.getElementById("pie"));
      var myPieCanvas = document.getElementById("pie").getContext("2d");

      var myPieChart = new Chart(myPieCanvas).Pie(data, {
      customTooltips: function(tooltip) {

        // tooltip will be false if tooltip is not visible or should be hidden
        if (!tooltip) {
            return;
        }

        };
      });
    };
    */

    ChartJsProvider.setOptions('Pie', {
      tooltipFontSize: 10,
      tooltipXPadding: 1,
      tooltipYPadding: 3,
      tooltipFontStyle: "300",
    });
  }])

  .controller('DetailsCtrl', function ($scope,selection,details) {

  var firstYear;
  var currentYearIndex = selection.year - firstYear;

  $scope.formatValue = function(val){
    // Add thousand's separator. Source: http://stackoverflow.com/a/2901298
    var parts = val.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");    return +val;

    //return val.toLocaleString();
  };

  $scope.tooltipSafeUnits = function(chart){
    if(chart.units.indexOf('<su')>=0) {
      return chart.originalUnits;
    } else {
      return chart.units;
    }
  };

  $scope.tooltipTextFunction = function(chart){
    return function(label){
//      console.log('Here with ',label);
      return label.label + ': ' + $scope.formatValue(label.value) + ' ' + $scope.tooltipSafeUnits(chart);
    };
  };


  $scope.bar = {
    title:null,
    description:null,
    units: null,
    originalUnits: null
  };

  $scope.pie = {
    title:null,
    description:null,
    units: null,
    originalUnits: null
  };

  $scope.barOptions =  {
      // Sets the chart to be responsive
      responsive: true,

      //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
      scaleBeginAtZero : false,

      //Boolean - Whether grid lines are shown across the chart
      scaleShowGridLines : true,

      //String - Colour of the grid lines
      scaleGridLineColor : "rgba(0,0,0,.05)",

      //Number - Width of the grid lines
      scaleGridLineWidth : 1,

      //Boolean - If there is a stroke on each bar
      barShowStroke : true,

      //Number - Pixel width of the bar stroke
      barStrokeWidth : 0.1,

      //Number - Spacing between each of the X value sets
      barValueSpacing : 2,

      //Number - Spacing between data sets within X values
      barDatasetSpacing : 1,
      tooltipTemplate: $scope.tooltipTextFunction($scope.bar)
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

    $scope.selection = selection;
    $scope.viewOptions = [
      {
        style:'bar',
        icon:'fa-bar-chart',
        tooltip:'Annual time series',
      },
      {
        style:'pie',
        icon:'fa-pie-chart',
        tooltip:'Proportion by land cover type',
      }//,
//      {
//        style:'timeseries',
//        icon:'fa-line-chart',
//        tooltip:'Detailed time series'
//      }
    ];

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
        chart.units = details.unitsText(data.Units);
        chart.originalUnits = data.Units;
        /*
        if(chart === $scope.bar) {
          $scope.viewOptions[0].description = chart.description;
        } else if(chart === $scope.pie) {
          $scope.viewOptions[1].description = chart.description;
        }
        */
    };


    $scope.createBarChart = function(placeId,label){
      details.getBarChartData().then(function(data){
        $scope.barChartData = data;
        //$scope.units = details.unitsText($scope.barChartData.Units);
        $scope.barLabels = [];
        $scope.barSeries = [];
        $scope.barData = [];
        $scope.populateLabels($scope.bar,data);
        $scope.barLabels = $scope.barChartData.columnNames;
        $scope.barSeries.push(label);
        var indexName = "PlaceIndex" + placeId;
        $scope.barData.push($scope.barChartData[indexName]);
        firstYear = $scope.barLabels[0];

        for (var i=0; i<$scope.barLabels.length; i++) {
          if (selection.year === parseInt($scope.barLabels[i])) {
            currentYearIndex = i;
            break;
          }
        }

        /*
        for (var i=0; i<$scope.barLabels.length; i++) {
          $scope.barColors[0].fillColor[i] = "#66987F";
        }
        */

        $scope.barColors = [{fillColor:["#66987F"]}];
        $scope.barColors[0].fillColor[currentYearIndex] = "#2B5F45";

        if (currentYearIndex < $scope.barLabels.length-1) {
          $scope.barColors[0].fillColor[currentYearIndex+1] = "#66987F";
        }
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

        $scope.pieColours = $scope.pieChartData.columnNames.map(function(col){
          var presentation = $scope.pieChartData.columnPresentation[col];
          //return 'rgb('+presentation.Red+','+presentation.Green+','+presentation.Blue+')';
          var hex = rgbToHex(presentation.Red, presentation.Green, presentation.Blue);
          return hex;
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

    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    //<editor-fold desc="pete linegraph">
    $scope.createLineChart = function(/*placeId,label*/){
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

//    $scope.onLineClick = function (points, evt) {
//
//    };
//
//    $scope.$on('create', function (event, chart) {  //how to limit to just line graph?
//    });
//
//    $scope.$on('update', function (event, chart) {  //how to limit to just line graph?
//    });

    $scope.pieChartOptions = {
      animateRotate: false,
      animationSteps: 1,
      tooltipTemplate: $scope.tooltipTextFunction($scope.pie)
    };
  });
