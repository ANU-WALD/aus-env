'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:LocationselectionCtrl
 * @description
 * # LocationselectionCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('LocationselectionCtrl', function ($scope,$log,$q,selection) {
    $scope.selection = selection;

    $scope.accordions={
      options:false
    };
    $scope.toggleSelectionMode = function(evt){
      evt.preventDefault();
      $scope.accordions.options=false;
      if(selection.selectionMode==='point'){
        selection.selectionMode='region';
      } else {
        selection.selectionMode='point';
      }
    };

    $scope.needAPoint = function(){
      return !$scope.noChartsAvailable()&&(selection.selectionMode==='point')&&!selection.selectedPoint;
    };

    $scope.needARegion = function(){
      return !$scope.noChartsAvailable()&&(selection.selectionMode==='region')&&!selection.selectedRegion;
    };

    $scope.noChartsAvailable = function(){
      return selection.selectedLayer&&(
        ((selection.selectionMode==='point')&&(selection.selectedLayer.disablePoint))||
        ((selection.selectionMode==='region')&&(selection.selectedLayer.disablePolygons))
      );
    };


    $scope.checkDataURISupport = function(){
      // Adapted from http://stackoverflow.com/a/36915691
      var result = $q.defer();
      try {
          var request = new XMLHttpRequest();
          request.onload = function reqListener() {
              result.resolve(true);
          };
          request.onerror = function reqListener() {
              result.resolve(false);
          };
          request.open('GET', 'data:application/pdf;base64,cw==');
          request.send();
      } catch (ex) {
          result.resolve(false);
      }
      return result.promise;
    };

    $scope.checkDataURISupport().then(function(supported){
      $scope.dataURISupported = supported;

      if(!supported){
        $scope.dataDownloadMessage = 'CSV download supported in Firefox, Chrome';
      }
    });
  });
