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
    	selected_day: 'DD',
    	selected_month: 'MM',
    	selected_year: 'YYYY',
    	
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
            // http://dapds00.nci.org.au/thredds/wms/ub8/global/nc/1d/actual/Stot/20150920_Stot_daily.nc?service=WMS&version=1.3.0&request=GetCapabilities
            // http://dapds00.nci.org.au/thredds/wms/ub8/OzWALD/AWRA.run20160107.daily.D.2000.01.nc?service=WMS&version=1.3.0&request=GetCapabilities
            name: 'Some Model Results',
            type: 'wms',
            visible: true,
            url: 'http://dapds00.nci.org.au/thredds/wms/ub8/global/nc/1d/actual/Stot/20150920_Stot_daily.nc?',
            doRefresh: true,
            layerParams: {
              layers: 'Stot_daily',
              time:'2015-09-20',
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
      }
    });
		
		$scope.urlChangedFunction = function() {
			$scope.$apply();
			alert($scope.layers.overlays.aWMS.url);
			alert($scope.selected_day);



			//alert($scope.layers.overlays.aWMS.layerParams.time);
			//$scope.layers.overlays.aWMS.redraw();
			//$scope.invalidateSize();
			//$route.reload();
		};
  });

	