'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:SharingCtrl
 * @description
 * # SharingCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('SharingCtrl', function ($scope,$location) {

    $scope.currentViewURL = $location.absUrl();
    $scope.topLevelURL = $location.absUrl().split('#')[0];

    $scope.embedPath = function(p){
      return '<iframe width="800" height="600" frameborder="0" src="'+
              p + '"></iframe>';
    };

    $scope.currentViewEmbed = $scope.embedPath($scope.currentViewURL);
    $scope.topLevelEmbed = $scope.embedPath($scope.topLevelURL);

  });
