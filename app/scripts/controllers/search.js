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
        $scope.selection.availableFeatures = data.features.map(function(f){
          return {
            name:f.properties[newOption.labelField],
            feature:f
          };
        });
        $scope.selection.availableFeatures.sort(function(a,b){return a.name.localeCompare(b.name);});
      });
    }; //regionTypeChanged

    $scope.canCentre = function() {
      //console.log(selection.mapMode);
      return true;  //Can always centre on Australia
      //return (selection.mapMode === 'Polygon') && ($scope.selection.selectedRegion !== undefined);
    }; //canCentre

    $scope.zoomToFeature = function() {
      if ((selection.mapMode === 'Polygon') || ($scope.selection.selectedRegion === undefined)) {
        var geojson = L.geoJson($scope.selection.selectedRegion.feature);
        leafletData.getMap().then(function (map) {
          map.fitBounds(geojson.getBounds(), {maxZoom: 13});
        });
      } else {
        leafletData.getMap().then(function (map) {
          map.setView([-23.07, 135.08], 4.5);
        });
        // need to change this to automate to show map of Australia best fit to leaflet control
      }
    }; //zoomToFeature

  });
