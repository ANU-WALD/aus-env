'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:ThechartsCtrl
 * @description
 * # ThechartsCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('ThechartsCtrl', function ($scope) {
    $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  	$scope.data = [300, 500, 100];
  });
