'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('SearchCtrl', function ($scope,$filter,staticData,selection,spatialFoci,leafletData,bugs) {
    $scope.selection = selection;
    staticData.unwrap($scope,'options',spatialFoci.regionTypes);
    $scope.features = [];

    $scope.regionTypeChanged = function(newOption) {
      if(!newOption){
        return;
      }
      newOption.jsonData().then(function(data){
        $scope.features = data.features.map(function(f){
          return {
            name:f.properties[newOption.labelField],
            feature:f
          };
        });
        $scope.features.sort(function(a,b){return a.name.localeCompare(b.name);});
      })
    };

    $scope.LD = leafletData;

    //$scope.LBH = leafletBoundsHelpers;

    $scope.canCentre = function() {
      return !(selection.selectedRegion === undefined);
      //possibly add valid name??
    };


    //think this should be in a service, useful for remembering previous map state styles etc
    $scope.centreOnFeature = function() {


      console.log(selection.regionType.labelField);

      console.log($scope.selection.selectedRegion);

      //THIS SEEMS TO BE GETTING WHAT I'M AFTER!!
      //$scope.LD.getGeoJSON().then(function(json) { console.log(json._layers); } );
      //Now see if I can manipulate things...  change style or something??

      $scope.LD.getMap().then(function(map){

        console.log(map);
        //map.eachLayer(function(lll) {
        //  console.log($scope.selection.selectedRegion.name);
        //  console.log(lll); }
        //);



        console.log(map._layers);
        $scope.LD.getGeoJSON().then(function(gj) {
          console.log(gj._layers);
          //var result = "";
          //for (var i in gj._layers) {
          //  if (gj._layers.hasOwnProperty(i)) {
          //    result += "_layers." + i + " = " + gj._layers[i] + "\n";
          //  }
          //}
          //console.log(result);
          //console.log(gj._layers["76"]);
          var found = false;
          gj.eachLayer(function(jjj) {
            //console.log(jjj.feature.properties.NRMR_NAME);
            //console.log(jjj);
            if (jjj.feature.properties[selection.regionType.labelField] === $scope.selection.selectedRegion.name) {
              //console.log(jjj.getBounds());
              map.fitBounds(jjj.getBounds());
              //jjj.setStyle({
              //  weight: 2,
              //  color: '#0',
              //  fillColor: 'black'
              //});
              //jjj.bringToFront();
              found = true;
            }
          }); //eachLayer
          if (!found) {
            bugs.addBug("Cannot find " + $scope.selection.selectedRegion,$filter('json')($scope.selection.selectedRegion))
          }
        });  //then getGeoJSON



        //map.fitBounds([ [40.712, -74.227], [40.774, -74.125] ]);
      });

    }; //centreOnFeature

  });
