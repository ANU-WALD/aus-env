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
        }
      });
    };
    */

    ChartJsProvider.setOptions('Pie', {
      tooltipFontSize: 9,
      tooltipXPadding: 1,
      tooltipYPadding: 3,
      tooltipFontStyle: "300",
    });
  }])

  .controller('RegionChartsCtrl', function ($scope,$q,selection,details) {
    $scope.selection = selection;
    $scope.watchList = ['selectionMode','selectedRegion','selectedLayer','regionType'];
    $scope.selectedRegionArea = null;

    $scope.origViewOptions = [
      {
        style:'bar',
        icon:'fa-bar-chart',
        tooltip:'Annual time series'
      },
      {
        style:'pie',
        icon:'fa-pie-chart',
        tooltip:'Proportion by land cover type'
      }
    ];

    $scope.viewOptions = $scope.origViewOptions.slice();

    $scope.canShowChart = function(style,layer,regionType){
      layer = layer || $scope.selection.selectedLayer;
      regionType = regionType || $scope.selection.regionType;
      return layer&&regionType&&!(layer['disable-'+style]||regionType['disable-'+style]);
    };

    $scope.updateViewOptions = function(layer){
      if(($scope.selection.selectedDetailsView===null)||
         ($scope.selection.selectedDetailsView===undefined)){
        return;
      }
      var selected = $scope.viewOptions[$scope.selection.selectedDetailsView];
      if(!$scope.canShowChart(selected.style,layer)) {
        $scope.selection.selectedDetailsView =
          ($scope.selection.selectedDetailsView+1)%$scope.viewOptions.length;
      }
    };

    $scope.updateRegionArea = function(PlaceId) {
//      if(PlaceId===9999) {
//        $scope.selectedRegionArea=null;
//      } else {
      details.getRegionAreas().then(function(data){
//        if(PlaceId===9999){
//          $scope.selectedRegionArea=null;
//        } else {
        var row = data['PlaceIndex'+PlaceId];
        if(row) {
          $scope.selectedRegionArea=row[row.length-1].toFixed();
        } else {
          $scope.selectedRegionArea=null;
        }
//        }
      });
//      }
    };

    $scope.locate = function(){
      var result = {
        id:null,
        label:null
      };

      if(selection.regionType){
        if(selection.selectedRegion) {
          var keyField = selection.regionType.keyField;
          result.id = selection.selectedRegion.feature.properties[keyField];
          if(result.id) {
            result.label = selection.selectedRegion.name;
          } else {
            result.id = 9999;
            result.label = selection.regionType.globalLabel || 'National';
          }
        } else {
          result.id = 9999;
          result.label = selection.regionType.globalLabel || 'National';
        }
      }

      return result;
    };

    $scope.getBarData = function(){
      var result = $q.defer();
      var locators = $scope.locate();

      details.getPolygonAnnualTimeSeries().then(function(csvData){
        if(!csvData){
          result.reject();
          return;
        }
//        $scope.barChartData = data;
//        $scope.bar.download = data.URL;
//        $scope.units = data.Units;

        var indexName = "PlaceIndex" + locators.id;

        var data = csvData.columnNames.map(function(col,i){
          return {
            value:csvData[indexName][i],
            label:col
          }
        });
        result.resolve([data,csvData]);
      });
      return result.promise;
    };

    $scope.getPieData = function(){
      var result = $q.defer();
      var locators = $scope.locate();

      details.getPieChartData().then(function(data){
//        $scope.pieChartData = data;
//        $scope.pie.download = data.URL;
//        $scope.pieData = [];
//        details.populateLabels($scope.pie,data);

        var labels = data.columnNames.map(function(column){
          return data.columnPresentation[column].Class_Name;
        });

        var colours = data.columnNames.map(function(column){
          var pres = data.columnPresentation[column];
          return rgbToHex(pres.Red,pres.Green,pres.Blue);
        });

        var indexName = "PlaceIndex" + locators.id;
        var series = data[indexName];
        result.resolve([series,labels,colours,data]);
      });
      return result.promise;
    };

    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    $scope.locationLabel = function(){
      return selection.selectedRegionName();
    };
  });
