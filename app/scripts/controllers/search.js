'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('SearchCtrl', function ($scope,staticData,selection,spatialFoci) {
    $scope.selection = selection;
    staticData.unwrap($scope,'options',spatialFoci.regionTypes);
    $scope.features = [];

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
    };
  });
