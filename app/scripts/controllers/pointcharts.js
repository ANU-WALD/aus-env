'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:PointchartsCtrl
 * @description
 * # PointchartsCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('PointchartsCtrl', function ($scope,$interpolate,$q,selection,details,timeseries,spatialFoci) {
    $scope.selection = selection;
    $scope.watchList = ['selectionMode','selectedLayer','selectedPoint'];

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

    $scope.locationLabel = function(){
      return $interpolate('{{selectedPoint.lat() | number:4}}&deg;,{{selectedPoint.lng()|number:4}}&deg;')(selection);
    };

    $scope.canShowChart = function(style,layer,regionType){
      layer = layer || $scope.selection.selectedLayer;
      regionType = regionType || $scope.selection.regionType;
      return layer&&regionType&&!(layer['disable-'+style]||regionType['disable-'+style]);
    };

    $scope.createPointCharts = function(){
      // Annual time series...
      if($scope.canShowChart('bar')){
        $scope.createAnnualTimeSeries();
      }

      // High frequency time series...
      if($scope.canShowChart('timeseries')){
        $scope.createTimeSeriesPoint();
      }
    };

    $scope.buildEvents = function(dapData,variable){
      return dapData[variable].map(function(v,i){
        return {
          value: v,
          label: dapData.time[i].getFullYear()
        };
      });
    };

    $scope.getBarData = function(){
      var result = $q.defer();

      var layer = $scope.selection.selectedLayer;
      layer = layer.normal || layer;
      var pt = $scope.selection.selectedPoint;

      if(!pt){
        result.reject();
        return result.promise;
      }

      spatialFoci.regionTypes().then(function(rt){
        $q.all([timeseries.retrieveAnnualForPoint(pt,layer),details.getPolygonAnnualTimeSeries(rt[0])]).then(function(resp){
          var dapData = resp[0];
          var metadata = resp[1];

          var data = $scope.buildEvents(dapData,layer.variable);
          result.resolve([data,metadata]);
        });

//        .then(function(pointAndPolyTS){
//          var data = pointAndPolyTS[0];
//          var csvData = pointAndPolyTS[1];
//          // +++TODO Is it making multiple Opendap requests???
//          //console.log(data);
//          $scope.barData = [];
//          $scope.barData.push(data[layer.variable]);
//          $scope.barLabels = data.time.map(function(dt){return dt.getFullYear();});
//          $scope.barSeries = ['TS'];
//          $scope.barColors = details.assignBarChartColours($scope.barLabels);
//          details.populateLabels($scope.bar,csvData);
//        });
      });

      return result.promise;
    };

    $scope.getLineChartData = function(){
      var result = $q.defer();

      var layer = $scope.selection.selectedLayer;
      layer = layer.timeseries;
      if(!layer){
        result.rejct();return result.promise;
      }
      var pt = $scope.selection.selectedPoint;
      if(!pt){
        result.rejct();return result.promise;
      }

      spatialFoci.regionTypes().then(function(rt){
        $q.all([timeseries.retrieveTimeSeriesForPoint(pt,layer,selection.year),details.getPolygonAnnualTimeSeries(rt[0])]).then(function(resp){
          var data = resp[0];
          var metadata = resp[1];
          result.resolve([data[layer.variable],data.time,metadata]);
        });
      });

      return result.promise;
    };

    $scope.createTimeSeriesPoint = function(){
      // Clear data...

        // +++TODO Is it making multiple Opendap requests???
//        $scope.createLineChart(data[layer.variable]);
//        $scope.barData = [];
//        $scope.barData.push(data[layer.variable]);
//        $scope.barLabels = data.time.map(function(dt){return dt.getFullYear();});
//        $scope.barSeries = ['TS'];
//        $scope.assignBarChartColours();
//      });
    };

//    $scope.watchList.forEach(function(prop){
//      $scope.$watch('selection.'+prop,$scope.createPointCharts);
//    });

//    $scope.$watch('selection.year',function(){
//      if(selection.useSelectedPoint()&&$scope.canShowChart('timeseries')){
//        $scope.createTimeSeriesPoint();
//
//        // TODO: Update highlighted year in bar chart
//      }
//    });
  });
