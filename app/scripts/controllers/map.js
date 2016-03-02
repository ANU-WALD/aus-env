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

    angular.extend($scope, {
      defaults: {
        scrollWheelZoom: false,
        crs: L.CRS.EPSG4326
      }, //defaults

      mapCentre: {
        lat: selection.ozLatLngZm.lat,
        lng: selection.ozLatLngZm.lng,
        zoom: selection.ozLatLngZm.zoom
      }, //mapCentre

      layers: {
        baselayers: {
//          osm: {
//            name: 'OpenStreetMap',
//            url: 'http://129.206.228.72/cached/osm?',
//            type: 'wms',
//            layerParams:{
//              version: '1.1.1',
//              format: 'image/png',
//              layers:'osm_auto:all'
//            }
//          },
        }, //layers.baselayers

        overlays: {
          mask: {
            name: 'Ocean Mask',
//            url:'http://40.127.88.222:8000/wms?',
            url: selection.WMS_SERVER + '/public/wms?',
//            url:'http://localhost:8881/public/wms?',
            //service=WMS&version=1.1.0&request=GetMap&layers=public:TM_WORLD_BORDERS-0.3&styles=&bbox=-179.99999999999997,-90.0,180.0,83.62359600000008&width=768&height=370&srs=EPSG:4326&format=image%2Fpng'
            type: 'wms',
            visible: true,
            layerParams: {
              version: '1.1.1',
              format: 'image/png',
              layers: 'public:water_polygons_simple25',
              transparent: true
            }
          },  //overlays.mask
          countries: {
            name: 'Countries',
            url: selection.WMS_SERVER + '/public/wms?',
//            url:'http://localhost:8881/public/wms?',
            //service=WMS&version=1.1.0&request=GetMap&layers=public:TM_WORLD_BORDERS-0.3&styles=&bbox=-179.99999999999997,-90.0,180.0,83.62359600000008&width=768&height=370&srs=EPSG:4326&format=image%2Fpng'
            type: 'wms',
            visible: true,
            layerParams: {
              version: '1.1.1',
              format: 'image/png',
              layers: 'public:TM_WORLD_BORDERS-0.3',
              transparent: true
            }
          }, //layers.overlays.countries
        } //layers.overlays
      }, //layers

      dateComponents: {
        selected_day: 'DD',
        selected_month: 'MM',
        selected_year: 'YYYY'
      },  //dateComponents

      events: {
        map: {
          enable: ['zoomstart', 'drag', 'click', 'mousemove'],
          logic: 'emit'
        }
      },  //events

      coordinates: {
        latitude: null,
        longitude: null
      },  //coordinates

      geojson: null

    });  //extend service (with leaflet stuff)


    /* here defined all the event handler, please feel free to ask Chin */

    $scope.$on('leafletDirectiveMap.click', function(event, args){
      //console.log(args.leafletEvent.target);
      //selection.setCoordinates(args.leafletEvent.latlng);
      //selection.leafletData.getMap().then(function(map) { console.log(map); });
      //console.log(args);
    });


    $scope.$on('leafletDirectiveGeoJson.click',function(event,args){
      //console.log(args.leafletEvent.target);
      var newFeature = args.leafletEvent.target.feature;
      selection.selectedRegion = selection.availableFeatures.filter(function(f){
        return f.name===newFeature.properties[selection.regionType.labelField];
      })[0];
    });

    /* the function to change the date parameters of the layer, please feel free to ask Chin */
    $scope.dateChangedFunction = function() {
      $scope.selection.layers.overlays.aWMS.layerParams.time = $scope.dateComponents.selected_year + '-' + $scope.dateComponents.selected_month + '-' + $scope.dateComponents.selected_day;
      $scope.selection.layers.overlays.aWMS.doRefresh = true;
    };

    /* the function to change the url of the layer, please feel free to ask Chin */
    $scope.urlChangedFunction = function() {
      $scope.selection.layers.overlays.aWMS.doRefresh = true;
    };

  $scope.$watch('selection.themeObject',function(newVal){
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

    $scope.selection.geojson = {};
//
//    if(!newVal._jsonData) {
//      newVal._jsonData = $http.get('static/'+newVal.source + '.json');
//    }
//    // +++ Causing stack overflows??? Due to leaflet events perhaps?
    $scope.layers.overlays.selectionLayer = {
      name: newVal.name,
      url:$scope.selection.WMS_SERVER+'/wald/wms?',
//            url:'http://localhost:8880/geoserver/wald/wms?',
//            url:'http://localhost:8881/wald/wms?',
      //service=WMS&version=1.1.0&request=GetMap&layers=public:TM_WORLD_BORDERS-0.3&styles=&bbox=-179.99999999999997,-90.0,180.0,83.62359600000008&width=768&height=370&srs=EPSG:4326&format=image%2Fpng'
      type:'wms',
      visible:true,
      doRefresh:true,
      layerParams:{
        version:'1.1.1',
        format:'image/png',
        layers:'wald:'+(newVal.sourceWMS||newVal.source),
        transparent:true,
        zIndex:50
      }
    };
    newVal.jsonData().then(function(resp){
      console.log(resp);
      $scope.selection.geojson = {
        data:resp,
        style:{
          weight:0,
          fillOpacity:0
        }
      };
    });
  });

  $scope.clearView = function() {
    console.log("called clearView");
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

    $scope.layers.overlays.aWMS = $scope.selection.makeLayer();

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
        $scope.selection.geojson = {
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
    selection.theme = themesData[1].name;
    selection.themeObject = themesData[1];
  };

  themes.themes().then($scope.setDefaultTheme);
});
