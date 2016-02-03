'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the ausEnvApp
 */

angular.module('ausEnvApp')
  .controller('MapCtrl', function ($scope,$route,selection) {
    $scope.selection = selection;

    angular.extend($scope,{
      
      defaults:{
        crs: L.CRS.EPSG4326
      },
        
      mapCentre:{
        lat: -23.07,
        lng: 135.08,
        zoom: 4
      },

      layers:{
        baselayers:{
          osm: {
            name: 'OpenStreetMap',
            url: 'http://129.206.228.72/cached/osm?',
            type: 'wms',
            layerParams:{
              version: '1.1.1',
              format: 'image/png',
              layers:'osm_auto:all'
            }
          },
        },

        overlays:{
          aWMS:{
            name: 'Some Model Results',
            type: 'wms',
            visible: true,
            url: 'http://dapds00.nci.org.au/thredds/wms/ub8/au/OzWALD/daily/AWRA.daily.Stot.2011.nc?',
            doRefresh: true,
            layerParams: {
              layers: 'Stot',
              time:'2011-02-01',
              format: 'image/png',
              transparent: true,
              logscale:false,
              styles:'boxfill/rainbow',
              numcolorbands:50,
              colorscalerange:'0,1000',
              belowmincolor:'extend',abovemaxcolor:'extend'
            }
          }
        }
      }, 

      dateComponents:{
        selected_day: 'DD',
        selected_month: 'MM',
        selected_year: 'YYYY'
      },

      events: {
        map: {
          enable: ['zoomstart', 'drag', 'click', 'mousemove'],
            logic: 'emit'
        }
      },

      coordinates:{
        latitude:null,
        longitude:null
      }
    });

    /* here defined all the event handler, please feel free to ask Chin */
    $scope.$on('leafletDirectiveMap.click', function(event, args){
      //window.alert(args.leafletEvent.latlng.lng);
      $scope.coordinates.latitude = args.leafletEvent.latlng.lat;
      $scope.coordinates.longitude = args.leafletEvent.latlng.lng;
    });

    /* the function to change the url of the layer, please feel free to ask Chin */
    $scope.urlChangedFunction = function() {
      $scope.layers.overlays.aWMS.layerParams.time = $scope.dateComponents.selected_year + '-' + $scope.dateComponents.selected_month + '-' + $scope.dateComponents.selected_day;
      $scope.layers.overlays.aWMS.doRefresh = true;
    };
  });