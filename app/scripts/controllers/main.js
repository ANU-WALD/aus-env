'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('MainCtrl', function ($scope,$uibModal,selection) {
    $scope.selection = selection;
    $scope.options = {
      doNotShow:false
    };

    $scope.moveYear = function(dir){
      $scope.selection.moveYear(dir);
    };

    $scope.runningLocally = (window.location.hostname==='localhost');

    var options = {
      animation:true,
      templateUrl: 'views/about.html',
      scope: $scope
    };

    if(!localStorage.preventAbout){
      $scope.modalInstance = $uibModal.open(options);
    }

    $scope.closeModal = function(){
      $scope.modalInstance.dismiss();
    };

    $scope.doNotShowClicked = function(){
      console.log($scope.options);
      if($scope.options.doNotShow){
        localStorage.setItem('preventAbout',true);
      } else {
        localStorage.removeItem('preventAbout');
      }
    };
  });
