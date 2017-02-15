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
    var NO_POINT_MODE='Point selection mode not available for this layer. Switch to Region mode under options.';
    var NO_POINT_SELECTED = 'No point selected. Select a point on the map.';
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

    $scope.chartView = function(chart,visible,reason){
      for(var i in $scope.viewOptions){
        var c = $scope.viewOptions[i];
        if(c.style===chart){
          c.visible=visible;
          c.reason=visible?'':(reason||'');
          return;
        }
      }
    };

    $scope.noneAvailable = function(){
      return $scope.viewOptions.filter(function(vo){
        return vo.visible;
      }).length===0;
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

    $scope.buildMetadata = function(layer){
      return {
        label:layer.title,
        Title:layer.title,
        Description:layer.description,
        Units:layer.units
      };
    };

    $scope.getBarData = function(){
      var result = $q.defer();

      var layer = $scope.selection.selectedLayer;
      var metadata = $scope.buildMetadata(layer);

      if(layer.disablePoint){
        result.reject();
        $scope.chartView('bar',false,NO_POINT_MODE);
        return result.promise;
      }

      layer = layer.normal || layer;
      var pt = $scope.selection.selectedPoint;

      if(!pt){
        result.reject();
        $scope.chartView('bar',false,NO_POINT_SELECTED);
        return result.promise;
      }

      $scope.chartView('bar',true);

      spatialFoci.regionTypes().then(function(rt){
        timeseries.retrieveAnnualForPoint(pt,layer).then(function(resp){
          var dapData = resp;
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

      var metadata = $scope.buildMetadata(layer);
      layer = layer.timeseries;
      if(!layer){
        $scope.chartView('timeseries',false,NO_POINT_MODE);
        result.reject();return result.promise;
      }
      if(layer.disablePoint){
        result.reject();
        $scope.chartView('bar',false,NO_POINT_MODE);
        return result.promise;
      }

      var pt = $scope.selection.selectedPoint;
      if(!pt){
        $scope.chartView('timeseries',false,NO_POINT_SELECTED);
        result.reject();return result.promise;
      }

      $scope.chartView('timeseries',true);

      spatialFoci.regionTypes().then(function(rt){
        $q.all([timeseries.retrieveTimeSeriesForPoint(pt,layer,selection.year),details.getPolygonAnnualTimeSeries(rt[0])]).then(function(resp){
          var data = resp[0];
//          var metadata = resp[1];
          result.resolve([data[layer.variable],data.time,metadata,layer.units]);
        },function(){
          result.reject();
        });
      });

      return result.promise;
    };
  });
