'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('SearchCtrl', function ($scope,$filter,staticData,selection,spatialFoci,mapmodes) {
    $scope.selection = selection;
    $scope.mapmodes = mapmodes;
    $scope.loadingPolygons = false;
    staticData.unwrap($scope,'options',spatialFoci.regionTypes);

    $scope.$watch('selection.mapMode',function(newVal){
//      if(newVal===mapmodes.grid) {
//        selection.lastRegionType = selection.regionType;
//        selection.regionType=null;
//      } else {
      if(newVal===mapmodes.region) {
        if(!selection.regionType) {
          selection.regionType = selection.lastRegionType;
        }
        if(!selection.regionType && $scope.options) {
          selection.regionType = $scope.options[0];
        }
      }
    });

    $scope.regionTypeChanged = function(newOption) {
      if(!newOption){
        selection.mapMode = mapmodes.grid;
        return;
      }
//      selection.mapMode = mapmodes.region;
      $scope.loadingPolygons = true;
      newOption.jsonData().then(function(data){
        selection.availableFeatures = data.features.map(function(f){
          return {
            name:f.properties[newOption.labelField],
            feature:f
          };
        });
        selection.availableFeatures.sort(function(a,b){return a.name.localeCompare(b.name);});
        $scope.loadingPolygons = false;
      });
    }; //regionTypeChanged


    $scope.canUseSearchText = function() {
      return ((!selection.isMapModeGrid()) && (selection.regionType !== null));
    };  //canUseSearchText
  });
