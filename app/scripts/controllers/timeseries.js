'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:TimeseriesCtrl
 * @description
 * # TimeseriesCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('TimeseriesCtrl', function ($scope,$log,$element,$timeout,details,downloads,selection) {
    var Plotly = window.Plotly;
    var $ = window.$;
    $scope.line = details.chartMetaData();

    $scope.clearChart = function(){
      $scope.line = details.chartMetaData();
      $scope.lineData=[];
      $scope.lineSeries=[];
      var target = $element[0];
      target = $('.timeseries-chart',target)[0];

      Plotly.purge(target);
    };

    $scope.createTimeSeriesChart = function(){
      if(!$scope.selection.graphVisible.timeseries){
        $scope.clearChart();
        return;
      }

      $scope.getLineChartData().then(function(data){
        if(!$scope.selection.graphVisible.timeseries){
          $scope.clearChart();
          return;
        }

        var series = data[0];
        var labels = data[1];
        var metadata = data[2];
        var altUnits = data[3];
        $scope.lineData = [];
        $scope.lineData.push(series);
        $scope.lineSeries = ['TS'];
        details.populateLabels($scope.line,metadata);
        if(altUnits){
          $scope.line.units = details.unitsText(altUnits);
        }

        var range;
        if($scope.line.units==='%'){
          var actualVals = series.filter(function(v){
            return !isNaN(v);
          });
          var max = Math.max.apply(null, actualVals);
          var min = Math.min.apply(null, actualVals);
          if(max>99){
            range = [Math.min(95,20*Math.floor(min/20.0)),100];
          }
        }

        var _ = window._;
        $scope.line.download = downloads.downloadableTable(_.zip(labels.map(function(d){return d.toLocaleDateString('en-GB');}),series),['Date','Value']);
        $scope.line.download_fn = downloads.makeDownloadFilename($scope.locationLabel(),$scope.line.title,selection.year);
        var target = $element[0];
        target = $('.timeseries-chart',target)[0];

        $timeout(function(){
          Plotly.newPlot( target, [{
            x: labels,
            y: series,
            line:{
              color:details.themeColours.darkGreen
            }
           }], {
            margin: {
              l:40,
              r:10,
              b:30,
              t:10
            },
            xaxis:{
              tickformat:'%b'
            },
            yaxis:{
     //         title:$scope.line.units,
              range:range,
              tickfont: {
                size: 11,
                color: 'black'
              },
            },
            showlegend:false

          },{
            modeBarButtonsToRemove: ['hoverCompareCartesian','hoverClosestCartesian','lasso2d','select2d'],
            displaylogo: false
          });
        });
      },$scope.clearChart);
    };

    $scope.watchList.forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.createTimeSeriesChart);
    });

    $scope.$watch('selection.year',$scope.createTimeSeriesChart);

    $scope.$watch('selection.graphVisible.timeseries',$scope.createTimeSeriesChart);
  });
