'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('MainCtrl', function ($scope,selection) {
    $scope.selection = selection;
    $scope.YearAddOne = function() {
    	//window.alert($scope.selection.year);
    	//$scope.selection.year = $scope.selection.year + 1;
    };

    $scope.runningLocally = (window.location.hostname==='localhost');
  });
