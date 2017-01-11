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

    $scope.onTextClick = function ($event) {
        $event.target.select();
    };

    // http://stackoverflow.com/a/30810322
    $scope.copyTextFrom = function(selector){
      var copyTextarea = document.querySelector(selector);
      copyTextarea.select();

      try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
      } catch (err) {
        console.log('Oops, unable to copy');
      }
    }
  });
