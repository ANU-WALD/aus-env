'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:PieCtrl
 * @description
 * # PieCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('PieCtrl', function ($scope) {
    $scope.awesomeThings = [
      	$scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  		$scope.data = [300, 500, 100];	
    ];
  });
