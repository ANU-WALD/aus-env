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
        tooltip:'Annual time series',
        visible:true
      },
      {
        style:'timeseries',
        icon:'fa-line-chart',
        tooltip:'Detailed time series',
        visible:true
      }
    ];

    $scope.viewOptions = $scope.origViewOptions.slice();

    $scope.chartView = function(chart,visible){
      for(var i in $scope.viewOptions){
        var c = $scope.viewOptions[i];
        if(c.style===chart){
          c.visible=visible;
          return;
        }
      }
    };

    $scope.locationLabel = function(){
      return $interpolate('{{selectedPoint.lat() | number:4}}&deg;,{{selectedPoint.lng()|number:4}}&deg;')(selection);
    };

    $scope.canShowChart = function(style,layer,regionType){
      layer = layer || $scope.selection.selectedLayer;
      regionType = regionType || $scope.selection.regionType;
      return layer&&regionType&&!(layer['disable-'+style]||regionType['disable-'+style]);
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
        $scope.chartView('bar',false);
        return result.promise;
      }

      $scope.chartView('bar',true);

      spatialFoci.regionTypes().then(function(rt){
        $q.all([timeseries.retrieveAnnualForPoint(pt,layer),details.getPolygonAnnualTimeSeries(rt[0])]).then(function(resp){
          var dapData = resp[0];
          var metadata = resp[1];

          var data = $scope.buildEvents(dapData,layer.variable);
          result.resolve([data,metadata]);
        },function(){
          result.reject();
        });
      });

      return result.promise;
    };

    $scope.getLineChartData = function(){
      var result = $q.defer();

      var layer = $scope.selection.selectedLayer;
      layer = layer.timeseries;
      if(!layer){
        $scope.chartView('timeseries',false);
        result.reject();return result.promise;
      }
      var pt = $scope.selection.selectedPoint;
      if(!pt){
        $scope.chartView('timeseries',false);
        result.reject();return result.promise;
      }

      $scope.chartView('timeseries',true);

      spatialFoci.regionTypes().then(function(rt){
        $q.all([timeseries.retrieveTimeSeriesForPoint(pt,layer,selection.year),details.getPolygonAnnualTimeSeries(rt[0])]).then(function(resp){
          var data = resp[0];
          var metadata = resp[1];
          result.resolve([data[layer.variable],data.time,metadata,layer.units]);
        },function(){
          result.reject();
        });
      });

      return result.promise;
    };
  });
