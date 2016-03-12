'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('SearchCtrl', function ($scope,$filter,staticData,selection,spatialFoci) {
    $scope.selection = selection;
    staticData.unwrap($scope,'options',spatialFoci.regionTypes);

    $scope.$watch('selection.mapMode',function(newVal){
      if(newVal==='Grid') {
        selection.lastRegionType = selection.regionType;
        selection.regionType=null;
      } else {
        if(!selection.regionType) {
          selection.regionType = selection.lastRegionType;
        }
      }
    });

    $scope.regionTypeChanged = function(newOption) {
      if(!newOption){
        selection.mapMode = 'Grid';
        return;
      }
      selection.mapMode = 'Polygon';
      newOption.jsonData().then(function(data){
        selection.availableFeatures = data.features.map(function(f){
          return {
            name:f.properties[newOption.labelField],
            feature:f
          };
        });
        selection.availableFeatures.sort(function(a,b){return a.name.localeCompare(b.name);});
      });
    }; //regionTypeChanged


    $scope.canUseSearchText = function() {
      return ((!selection.isMapModeGrid()) && (selection.regionType !== null));
    };  //canUseSearchText
  });
