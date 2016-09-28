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
        // +++TODO If options isn't set at this point in startup,
        // +++     regionType might not be configured in time
      }
    });

    $scope.regionTypeChanged = function(newOption) {
      if(!spatialFoci.show(newOption)){
        selection.mapMode = mapmodes.grid;
      }
//      selection.mapMode = mapmodes.region;
      selection.initialisePolygons(newOption);
    }; //regionTypeChanged

    $scope.canUseSearchText = function() {
      return selection.regionType !== null;
    };  //canUseSearchText
  });
