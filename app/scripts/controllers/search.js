'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('SearchCtrl', function ($scope,$filter,staticData,selection,spatialFoci,leafletData) {
    $scope.selection = selection;
    staticData.unwrap($scope,'options',spatialFoci.regionTypes);
    $scope.features = [];

    //$scope.$watch('selection.mapMode', function (newVal) {
      //selection.selectedRegion = null;
      //console.log(selection.selectedRegion);
      //if (newVal === 'Polygon') selection.regionType = null;
      //console.log(newVal);
    //});

    $scope.regionTypeChanged = function(newOption) {
      if(!newOption){
        return;
      }
      newOption.jsonData().then(function(data){
        $scope.features = data.features.map(function(f){
          return {
            name:f.properties[newOption.labelField],
            feature:f
          };
        });
        $scope.features.sort(function(a,b){return a.name.localeCompare(b.name);});
      })
    }; //regionTypeChanged

    $scope.canCentre = function() {
      //console.log(selection.mapMode);
      return (selection.mapMode === 'Polygon') && ($scope.selection.selectedRegion !== undefined);
    }; //canCentre

    $scope.zoomToFeature = function() {
      var geojson = L.geoJson($scope.selection.selectedRegion.feature);
      leafletData.getMap().then(function(map) { map.fitBounds(geojson.getBounds()); } );
    }; //zoomToFeature

  });
