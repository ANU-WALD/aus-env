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
    $scope.appOptions = {
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
      if($scope.appOptions.doNotShow){
        localStorage.setItem('preventAbout',true);
      } else {
        localStorage.removeItem('preventAbout');
      }
    };

    var MAP_PROPERTY='mapCentre'
    var setMapProperty = function(prop){
      return function(urlElement){
        var val = +urlElement;

        if(!isNaN(val)){
          selection[MAP_PROPERTY][prop] = val;
        }
      };
    };

    var setCoordinate = function(prop){
      return function(urlElement){
        var val = +urlElement;

        if(!isNaN(val)){
          selection[MAP_PROPERTY].center[prop] = val;
        }
      };
    };

    var getMapProperty = function(prop,dp){
      dp = dp || 0;
      return function(){
        return selection[MAP_PROPERTY][prop].toFixed(dp);
      };
    };

    var getCoordinate = function(prop,dp){
      dp = dp || 0;
      return function(){
        return selection[MAP_PROPERTY].center[prop].toFixed(dp);
      };
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
      },
      {
        param:'selectedDetailsView',
        fromURL:function(urlElement){
          urlElement = urlElement.toLowerCase();
          var mode=0;

          switch(urlElement){
            case 'pie':
              mode=1;
              break;
            case 'line':
              mode=2;
              break;
          }

          selection.selectedDetailsView=mode;
        },
        toURL:function(){
          switch(selection.selectedDetailsView){
            case 1: return 'pie';
            case 2: return 'line';
            default: return 'annual';
          }
        }
      },
      {
        prefix:MAP_PROPERTY,
        custom:true,
        route:'latitude',
        fromURL:setCoordinate('latitude'),
        toURL:getCoordinate('latitude',2)
      },
      {
        prefix:MAP_PROPERTY,
        custom:true,
        route:'longitude',
        fromURL:setCoordinate('longitude'),
        toURL:getCoordinate('longitude',2)

      },
      {
        prefix:MAP_PROPERTY,
        custom:true,
        route:'zoom',
        fromURL:setMapProperty('zoom'),
        toURL:getMapProperty('zoom')
      },
      {
        param:'selectedRegion',
        altParam:'selectedPoint',
        fromURL:function(urlElement){
          var NONE='none';

          if(urlElement.toLowerCase()===NONE){
            return;
          }

          if($routeParams.regionType==='Point'){
            var components = urlElement.split(',');
            var pt = {
              lat: +components[0],
              lng: +components[1]
            };

            if(!isNaN(pt.lat)&&!isNaN(pt.lng)){
              selection.selectedPoint = pt;
            }
          } else {
            selection.selectRegionByName(urlElement,$routeParams.regionType);
          }
        },
        toURL:function(){
          var NONE='none';
          if(!selection.regionType){
            return NONE;
          }

          if(selection.regionType.name==='Point'){
            if(!selection.selectedPoint){
              return NONE;
            }

            return selection.selectedPoint.lat.toFixed(4)+','+
                   selection.selectedPoint.lng.toFixed(4);
          }

          if(selection.selectedRegion){
            return selection.selectedRegion.name;
          }
          return NONE;
        }
      }
    ];

    $scope.processRouteParams = function(){
      $scope.urlElements.forEach(function(elem){
        var p = elem.param || elem.route || elem;
        if($routeParams[p]!==undefined){
          if(elem.fromURL){
            elem.fromURL($routeParams[p])
          } else {
            selection[p] = $routeParams[p];
          }
        }
      });
    };

    $scope.processRouteParams();

    $scope.updateURL = function(){
      var lastRoute = $route.current;

      var un = $rootScope.$on('$locationChangeSuccess',function(){
        $route.current = lastRoute;
        un();
      });

      var newPath = '/' + $scope.urlElements.map(function(e){
        return e.toURL? e.toURL() : selection[e];
      }).join('/');

      $location.path(newPath).replace();
    };

    $scope.urlElements.forEach(function(e){
      if(e.param){
        var prefix = e.prefix?(e.prefix+'.'):''
        $scope.$watch('selection.'+prefix+e.param,$scope.updateURL);

        if(e.altParam){
          $scope.$watch('selection.'+prefix+e.altParam,$scope.updateURL);
        }
      } else if(!e.custom) {
        $scope.$watch('selection.'+e,$scope.updateURL);
      }
    });

    $scope.$watch('selection.mapCentre',$scope.updateURL,true);

    console.log('Building a controller...');

    if(!$routeParams.latitude){
      selection.centreAustralia();
    }
  });
