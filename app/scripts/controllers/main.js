'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('MainCtrl', function ($scope,$uibModal,$rootScope,$route,$routeParams,$location,
                                    selection,themes) {
    $scope.selection = selection;
    $scope.options = {
      doNotShow:false
    };

    $scope.moveYear = function(evt,dir){
      evt.preventDefault();
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

    $scope.urlElements = [
      {
        param:'year',
        fromURL:selection.setYear,
        toURL:function(){
          return ''+selection.year;
        }
      },
      {
        param:'selectedLayer',
        fromURL:function(urlElement){
          urlElement = urlElement.replace('_',' ');
          console.log(urlElement);
          themes.themes().then(function(allThemes){
            var found = false;
            allThemes.forEach(function(theme){
              if(found){
                return;
              }

              theme.layers.forEach(function(layer){
                if(found){
                  return;
                }

                if(layer.title===urlElement){
                  selection.selectTheme(theme);
                  selection.selectedLayer = layer;
                  found=true;
                }
              });
            });
          });

//          selection.setLayerByName(urlElement);
        },
        toURL:function(){
          return selection.selectedLayer?selection.selectedLayer.title.replace(' ','_'):'';
        }
      },
      'mapMode',
      'dataMode',
      {
        param:'regionType',
        fromURL:function(urlElement){
          urlElement = urlElement.replace('_',' ');
          selection.setRegionTypeByName(urlElement);
        },
        toURL:function(){
          return selection.regionType?selection.regionType.name.replace(' ','_'):'';
        }
      }
    ];

    $scope.processRouteParams = function(){
      $scope.urlElements.forEach(function(elem){
        var p = elem.param || elem;
        if($routeParams[p]){
          if(elem.fromURL){
            elem.fromURL($routeParams[p])
          } else {
            selection[p] = $routeParams[p];
          }
        }
      });
//      if(!isNaN(+$routeParams.year)){
//        selection.year = +$routeParams.year;
//      }
//
//      if($routeParams.layer){
//
//      }
    };

    $scope.processRouteParams();

    $scope.updateURL = function(){
      var lastRoute = $route.current;

      var un = $rootScope.$on('$locationChangeSuccess',function(){
//        console.log('here!');
        $route.current = lastRoute;
        un();
      });
      //if(!$route.current.pathParams.year){
      //  throw 'Whoa';
      //}

      var newPath = '/' + $scope.urlElements.map(function(e){
        return e.toURL? e.toURL() : selection[e];
      }).join('/');

      $location.path(newPath).replace();

      //$ngSilentLocation.silent('/'+selection.year);
    };

    $scope.urlElements.forEach(function(e){
      if(e.param){
        $scope.$watch('selection.'+e.param,$scope.updateURL);
      } else {
        $scope.$watch('selection.'+e,$scope.updateURL);
      }
    });

    console.log('Building a controller...');

  });
