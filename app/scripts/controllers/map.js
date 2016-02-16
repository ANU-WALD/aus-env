'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the ausEnvApp
 */

angular.module('ausEnvApp')
  .controller('MapCtrl', function ($scope,$route,$http,$interpolate,selection,themes) {
    $scope.selection = selection;

    angular.extend($scope,{
      defaults:{
        scrollWheelZoom: false,
        crs: L.CRS.EPSG4326
      },

      mapCentre:{
        lat: -23.07,
        lng: 135.08,
        zoom: 5
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
      },

      geojson:null
    });

    $scope.makeLayer = function() {
      return {
        name: 'Some Model Results',
        type: 'wms',
        visible: true,
//            url: 'http://localhost:8080/thredds/wms/testAll/rr_2015.nc?',
        url: 'http://localhost:8080/thredds/wms/testAll/ANUWALD.change.2015_rechunked.nc?',
        // 'http://dapds00.nci.org.au/thredds/wms/ub8/au/OzWALD/daily/AWRA.daily.Stot.2011.nc?',
        doRefresh: true,
        layerParams: {
//              layers: 'rain_day',
          layers: 'ChangeMap',
          time:'2015-12-31',
          format: 'image/png',
          transparent: true,
          logscale:false,
          styles:'boxfill/rainbow',
          tileSize:256,
          minZoom: 1,
          maxZoom: 15,
//              width:512,
//              height:512,
          numcolorbands:50,
          colorscalerange:'0,1',
          belowmincolor:'transparent',abovemaxcolor:'extend'
        }
      };

    };
    /* here defined all the event handler, please feel free to ask Chin */
    $scope.$on('leafletDirectiveMap.click', function(event, args){
      //window.alert(args.leafletEvent.latlng.lng);
      $scope.coordinates.latitude = args.leafletEvent.latlng.lat;
      $scope.coordinates.longitude = args.leafletEvent.latlng.lng;
    });

    $scope.$on('leafletDirectiveGeoJson.click',function(event,args){
      console.log(event);
      console.log(args);
    });

    /* the function to change the date parameters of the layer, please feel free to ask Chin */
    $scope.dateChangedFunction = function() {
      $scope.layers.overlays.aWMS.layerParams.time = $scope.dateComponents.selected_year + '-' + $scope.dateComponents.selected_month + '-' + $scope.dateComponents.selected_day;
      $scope.layers.overlays.aWMS.doRefresh = true;
    };

    /* the function to change the url of the layer, please feel free to ask Chin */
    $scope.urlChangedFunction = function() {
      $scope.layers.overlays.aWMS.doRefresh = true;
    };

  $scope.$watch('selection.themeObject',function(newVal,oldVal){
    if(!newVal){
      return;
    }

    $scope.clearView();
    $scope['configureView_'+newVal.mainView](newVal);
  });

  $scope.$watch('selection.regionType',function(newVal){
    if(!newVal){
      return;
    }
    console.log(newVal);

    $scope.geojson = {};
//
//    if(!newVal._jsonData) {
//      newVal._jsonData = $http.get('static/'+newVal.source + '.json');
//    }
//    // +++ Causing stack overflows??? Due to leaflet events perhaps?
    newVal.jsonData().then(function(resp){
      console.log(resp);
      $scope.geojson = {
        data:resp
      };
    });
  });

  $scope.clearView = function() {
    if($scope.layers.overlays.aWMS) {
      delete $scope.layers.overlays.aWMS;
    }

//    if($scope.layers.overlays.json) {
//      delete $scope.layers.overlays.json;
//    }
  };

  $scope.configureView_wms = function(themeObject){
    var defaultLayer = themeObject.layers.find(function(l){return l.default;});

    $scope.selection.selectedLayer = defaultLayer;
    $scope.selection.selectedLayerName = defaultLayer.title;
    $scope.configureView_json(themeObject);
  };

  $scope.showWMS = function(layer){
    if(!layer){
      return;
    }

    $scope.layers.overlays.aWMS = $scope.makeLayer();

    var fn = $interpolate(layer.url)(selection);
    var BASE_URL='http://dapds00.nci.org.au/thredds';

    $scope.layers.overlays.aWMS.name = layer.title;
    $scope.layers.overlays.aWMS.url = BASE_URL+'/wms/'+fn+'?';
    $scope.layers.overlays.aWMS.layerParams.time = $interpolate(layer.time)(selection);
    $scope.layers.overlays.aWMS.layerParams.layers = layer.variable;
    $scope.layers.overlays.aWMS.layerParams.colorscalerange = layer.colorscalerange;
    if(layer.belowmincolor){
      $scope.layers.overlays.aWMS.layerParams.belowmincolor = layer.belowmincolor;
    }

    if(layer.abovemaxcolor){
      $scope.layers.overlays.aWMS.layerParams.abovemaxcolor = layer.abovemaxcolor;
    }
    $scope.layers.overlays.aWMS.doRefresh = true;

  };

  $scope.$watch('selection.selectedLayer',$scope.showWMS);

  $scope.configureView_json = function(themeObject){
    if(themeObject.json) {
      if(!themeObject._jsonData) {
        themeObject._jsonData = $http.get('static/'+themeObject.json);
      }
      // +++ Causing stack overflows??? Due to leaflet events perhaps?
      themeObject._jsonData.then(function(resp){
        console.log(resp.data);
        $scope.geojson = {
          data:resp.data
        };
//        $scope.layers.overlays.json = {
//          name:themeObject.name,
//          type:'custom',
//          layer:new L.geoJson(resp.data),
//          visible:true,
//          doRefresh:true
//        };
      });
    }
  };

  $scope.setDefaultTheme = function(themesData){
    selection.theme = themesData[0].name;
    selection.themeObject = themes.themes[0];
  };

  themes.themes().then($scope.setDefaultTheme);
});
