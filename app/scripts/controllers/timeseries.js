'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:TimeseriesCtrl
 * @description
 * # TimeseriesCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('TimeseriesCtrl', function ($scope,$log,$element,details,downloads) {
    var Plotly = window.Plotly;
    var $ = window.$;
    $scope.line = details.chartMetaData();

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
      $scope.getLineChartData().then(function(data){
        var series = data[0];
        var labels = data[1];
        var metadata = data[2];
        $scope.lineLabels = $scope.makeSimpleLabels(series.length); // +++ TODO Don't need 365...
        $scope.lineData = [];
        $scope.lineData.push(series);
        $scope.lineSeries = ['TS'];
        details.populateLabels($scope.line,metadata);

        var _ = window._;
        $scope.line.download = downloads.downloadableTable(_.zip(labels.map(function(d){return d.toLocaleDateString('en-GB');}),series),['Date','Value']);
        $scope.line.download_fn = downloads.makeDownloadFilename($scope.locationLabel(),$scope.line.title);
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

        },{
          modeBarButtonsToRemove: ['hoverCompareCartesian','hoverClosestCartesian','lasso2d','select2d'],
          displaylogo: false
        });
      },function(){
        $scope.line = details.chartMetaData();
        $scope.lineLabels=[];
        $scope.lineData=[];
        $scope.lineSeries=[];
        var target = $element[0];
        target = $('.timeseries-chart',target)[0];

        Plotly.purge(target);
      });
    };

    $scope.watchList.forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.createTimeSeriesChart);
    });
  });
