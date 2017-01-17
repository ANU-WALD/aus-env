'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('SearchCtrl', function ($q,$scope,$filter,staticData,selection,spatialFoci,mapmodes) {
    $scope.selection = selection;
    $scope.mapmodes = mapmodes;
    $scope.coords={
      lat:NaN,
      lng:NaN
    };

    $scope.address={
      selected:null
    };

    $scope.coordChanged = function(){
      var g = window.google;
      selection.selectionMode='point';
      selection.selectedPoint = new g.maps.LatLng(+$scope.coords.lat,+$scope.coords.lng);
    };

    staticData.unwrap($scope,'options',spatialFoci.regionTypes);

    $scope.$watch('selection.selectedPoint',function(){
      if(!selection.selectedPoint){
        return;
      }

      $scope.coords.lat = selection.selectedPoint.lat().toFixed(3);
      $scope.coords.lng = selection.selectedPoint.lng().toFixed(3);
    });

    $scope.$watch('selection.mapMode',function(newVal){
//      if(newVal===mapmodes.grid) {
//        selection.lastRegionType = selection.regionType;
//        selection.regionType=null;
//      } else {
      if(newVal===mapmodes.region) {
        if(!selection.regionType) {
          selection.regionType = selection.lastRegionType;
        }
        if(!selection.regionType && $scope.options) {
          selection.regionType = $scope.options[0];
        }
        // +++TODO If options isn't set at this point in startup,
        // +++     regionType might not be configured in time
      }
    });

    $scope.regionTypeChanged = function(newOption) {
      if(!spatialFoci.show(newOption)){
        selection.mapMode = mapmodes.grid;
      }
//      selection.mapMode = mapmodes.region;
      selection.initialisePolygons(newOption);
    }; //regionTypeChanged

    $scope.canUseSearchText = function() {
      return selection.regionType !== null;
    };  //canUseSearchText

  $scope.getLocation = function(val) {
    var bnds = selection.ozLatLngMapBounds;
    var sw = new google.maps.LatLng(bnds.south,bnds.west);
    var ne = new google.maps.LatLng(bnds.north,bnds.east);
    bnds = new google.maps.LatLngBounds(sw,ne);

    var result = $q.defer();
    selection.doWithMap(function(map){
      var service = new google.maps.Geocoder();
      console.log(bnds);
      service.geocode({
        address:val,
        componentRestrictions: {
          country: 'AU'
        },
        region:'AU'
      },function(results,status){
        console.log(status);
        if(status!=='OK'){
          result.reject();
          return;
        }

        console.log(results);
        result.resolve(results.filter(function(r){
          return r.formatted_address!=='Australia';
        }));
      });
    });

    return result.promise;
    };

    var maybe = function(accessor){
      var source = $scope;
      accessor.split('.').forEach(function(a){
        if(source){
          source = source[a];
        }
      });
      return source;
    };

    $scope.zoomToPoint = function(){
      selection.selectionMode='point';
      selection.selectedPoint = new g.maps.LatLng(+$scope.coords.lat,+$scope.coords.lng);
      selection.zoomToSelectedPoint();
    };

    $scope.zoomToAddress = function(){
      console.log($scope.address);
      var pt = maybe('address.selected.geometry.location');
      console.log(pt);
      if(pt){
        selection.selectionMode='point';
        selection.selectedPoint=pt;
        selection.zoomToSelectedPoint();
      }
    };
  });
