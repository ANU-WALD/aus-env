'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:PointchartsCtrl
 * @description
 * # PointchartsCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('PointchartsCtrl', function ($scope,$interpolate,selection,details,timeseries) {
    $scope.selection = selection;

    $scope.origViewOptions = [
      {
        style:'bar',
        icon:'fa-bar-chart',
        tooltip:'Annual time series'
      },
      {
        style:'timeseries',
        icon:'fa-line-chart',
        tooltip:'Detailed time series'
      }
    ];

    $scope.viewOptions = $scope.origViewOptions.slice();

    $scope.bar = details.chartMetaData();
    $scope.line = details.chartMetaData();

    $scope.locationLabel = function(){
      return $interpolate('{{selectedPoint.lat() | number:4}}&deg;,{{selectedPoint.lng()|number:4}}&deg;')(selection);
    };

    $scope.createPointCharts = function(){
      // Annual time series...
      if($scope.canShowChart('bar')){
        $scope.createAnnualTimeSeriesPoint();
      }

      // High frequency time series...
      if($scope.canShowChart('timeseries')){
        $scope.createTimeSeriesPoint();
      }
    };

    $scope.createAnnualTimeSeriesPoint = function(){
      var layer = $scope.selection.selectedLayer;
      layer = layer.normal || layer;
      var pt = $scope.selection.selectedPoint;

      timeseries.retrieveAnnualForPoint(pt,layer).then(function(data){
        // +++TODO Is it making multiple Opendap requests???
        //console.log(data);
        $scope.barData = [];
        $scope.barData.push(data[layer.variable]);
        $scope.barLabels = data.time.map(function(dt){return dt.getFullYear();});
        $scope.barSeries = ['TS'];
        $scope.assignBarChartColours();
      });
    };

    $scope.createTimeSeriesPoint = function(){
      // Clear data...

      var layer = $scope.selection.selectedLayer;
      $scope.line.title = layer.title;

      layer = layer.timeseries;
      if(!layer){
        return;
      }
      var pt = $scope.selection.selectedPoint;

      timeseries.retrieveTimeSeriesForPoint(pt,layer,selection.year).then(function(data){
        // +++TODO Is it making multiple Opendap requests???
        $scope.createLineChart(data[layer.variable]);
//        $scope.barData = [];
//        $scope.barData.push(data[layer.variable]);
//        $scope.barLabels = data.time.map(function(dt){return dt.getFullYear();});
//        $scope.barSeries = ['TS'];
//        $scope.assignBarChartColours();
      });
    };

    ['selectionMode','selectedLayer','selectedPoint'].forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.createPointCharts);
    });

    $scope.$watch('selection.year',function(){
      if($scope.pointChartMode()&&$scope.canShowChart('timeseries')){
        $scope.createTimeSeriesPoint();
      }
    });
  });
