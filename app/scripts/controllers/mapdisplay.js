'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:MapdisplayCtrl
 * @description
 * # MapdisplayCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('MapdisplayCtrl', function ($scope,$timeout,staticData,mapmodes,backgroundmodes,selection,spatialFoci) {
    $scope.mapmodes = mapmodes;
    $scope.selection = selection;
    $scope.backgroundModes = backgroundmodes;
    staticData.unwrap($scope,'options',spatialFoci.regionTypes);

    $scope.dropdownsOpen={
      regionType:false,
      mapType:false,
      mapMode:false
    };

    $scope.enterDropDown=function(name){
      $scope.dropdownsOpen[name]=true;
    };

    $scope.exitDropDown=function(name){
      $scope.dropdownsOpen[name]='closing';
      $timeout(function(){
        if($scope.dropdownsOpen[name]==='closing'){
          $scope.dropdownsOpen[name]=false;
        }
      },250);
    };

    $scope.regionTypeChanged = function(newOption) {
      if(!spatialFoci.show(newOption)){
        selection.mapMode = mapmodes.grid;
      }
      selection.initialisePolygons(newOption);
    };
  });
