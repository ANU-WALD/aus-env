'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:PiechartsCtrl
 * @description
 * # PiechartsCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('PiechartsCtrl', function ($scope) {
	$scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  	$scope.data = [300, 500, 100];	
  });
