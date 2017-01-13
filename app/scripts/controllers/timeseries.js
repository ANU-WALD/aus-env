'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:TimeseriesCtrl
 * @description
 * # TimeseriesCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('TimeseriesCtrl', function ($scope,$log,$element,details) {
    var Plotly = window.Plotly;
    var $ = window.$;
    $scope.line = details.chartMetaData();

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
      pointHitDetectionRadius : 2,

      //Boolean - Whether to show a stroke for datasets
      datasetStroke : true,

      //Number - Pixel width of dataset stroke
      datasetStrokeWidth : 2,

      //Boolean - Whether to fill the dataset with a colour
      datasetFill : true,

      //String - A legend template
      //legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

    };

    $scope.makeSimpleLabels = function(length,prefix)
    {
      var pre = prefix || "";
      var labels = [];
      for(var i = 0; i<length; i++) {
        labels.push(pre + (i+1));
      }
      return labels;
    };

    $scope.createTimeSeriesChart = function(){
      $log.log('build time series chart');
      $scope.getLineChartData().then(function(data){
        var series = data[0];
        var labels = data[1];
        var metadata = data[2];
        $log.log('got time series data');
        $scope.lineLabels = $scope.makeSimpleLabels(series.length); // +++ TODO Don't need 365...
        $scope.lineData = [];
        $scope.lineData.push(series);
        $scope.lineSeries = ['TS'];
        details.populateLabels($scope.line,metadata);

        var target = $element[0];
        target = $('.timeseries-chart',target)[0];

        Plotly.newPlot( target, [{
          x: labels,
          y: series
         }], {
          margin: {
            l:40,
            r:10,
            b:30,
            t:10
          } ,
          showlegend:false
        });
      });
    };

    $scope.watchList.forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.createTimeSeriesChart);
    });
  });
