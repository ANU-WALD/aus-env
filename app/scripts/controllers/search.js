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
    $scope.names = [];

    $scope.regionTypeChanged = function(newOption) {
      if(!newOption){
        return;
      }
      newOption.jsonData().then(function(data){
        console.log('Region data');
        console.log(data);
      })
    };
  });
