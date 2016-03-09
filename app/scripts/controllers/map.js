'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the ausEnvApp
 */

angular.module('ausEnvApp')
  .controller('MapCtrl', function ($scope,$route,$http,$interpolate,$compile,selection,themes) {

    $scope.selection = selection;

    $scope.mapControls = {
      custom:[]
    };

    angular.extend($scope, {
      defaults: {
        crs: L.CRS.EPSG4326,
        attributionControl: false,
        zoomControl:false,
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
              transparent: true,
              showOnSelector: false
            }
          },  //overlays.mask
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

    $scope.$on('leafletDirectiveMap.load', function(event, args){
      selection.centreAustralia();
    });


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
      $scope.layers.overlays.aWMS.layerParams.time = $scope.dateComponents.selected_year + '-' + $scope.dateComponents.selected_month + '-' + $scope.dateComponents.selected_day;
      $scope.layers.overlays.aWMS.doRefresh = true;
    };

    /* the function to change the url of the layer, please feel free to ask Chin */
    $scope.urlChangedFunction = function() {
      $scope.layers.overlays.aWMS.doRefresh = true;
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
      $scope.selection.geojson = {};
      if($scope.layers.overlays.selectionLayer){
        delete $scope.layers.overlays.selectionLayer;
      }
      return;
    }
    console.log(newVal);

    $scope.geojson = {};
//
//    if(!newVal._jsonData) {
//      newVal._jsonData = $http.get('static/'+newVal.source + '.json');
//    }
//    // +++ Causing stack overflows??? Due to leaflet events perhaps?
    $scope.layers.overlays.selectionLayer = {
      name: newVal.name,
      url:selection.WMS_SERVER+'/wald/wms?',
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
        zIndex:50,
        showOnSelector: false
      }
    };
    newVal.jsonData().then(function(resp){
      console.log(resp);
      $scope.geojson = {
        data:resp,
        style:{
          weight:1,
          color:'green',
          //fillColor:'red',
          fillOpacity:0,
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

  $scope.showWMS = function(){
    var layer = selection.selectedLayer;
    if(!layer){
      return;
    }

    var prefix = '';
    var keys = ['time','variable','url','colorscalerange','belowmincolor','abovemaxcolor'];

    var settings = {};
    keys.forEach(function(k){settings[k] = layer[k]});
    console.log('HERE!!!!')
    console.log(selection.dataMode);
    console.log(layer);
    if(layer[selection.dataMode]) {
      if(selection.dataMode==='delta') {
        prefix = 'Change in '
      }
      keys.forEach(function(k){
        settings[k] = layer[selection.dataMode][key] || settings[k];
      })
    }
    $scope.layers.overlays.aWMS = $scope.selection.makeLayer();

    var fn = $interpolate(settings.url)(selection);
    var BASE_URL='http://dapds00.nci.org.au/thredds';

    $scope.layers.overlays.aWMS.name = prefix + layer.title;
    $scope.layers.overlays.aWMS.url = BASE_URL+'/wms/'+fn+'?';
    $scope.layers.overlays.aWMS.layerParams.time = $interpolate(settings.time)(selection);
    $scope.layers.overlays.aWMS.layerParams.layers = settings.variable;
    $scope.layers.overlays.aWMS.layerParams.colorscalerange = settings.colorscalerange;
    if(settings.belowmincolor){
      $scope.layers.overlays.aWMS.layerParams.belowmincolor = settings.belowmincolor;
    }

    if(settings.abovemaxcolor){
      $scope.layers.overlays.aWMS.layerParams.abovemaxcolor = settings.abovemaxcolor;
    }
    $scope.layers.overlays.aWMS.layerParams.showOnSelector = false;
    $scope.layers.overlays.aWMS.doRefresh = true;

  };

  $scope.$watch('selection.selectedLayer',$scope.showWMS);
  $scope.$watch('selection.dataMode',$scope.showWMS);

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

  var createLeafeletCustomControl = function(pos,template) {
    var ctrl = new L.Control({position:pos});

    ctrl.onAdd =
      function() {
        var div = L.DomUtil.create('div');
        var container = L.DomUtil.create('div','',div);
        container.setAttribute('ng-include','\'views/maptools/'+template+'.html\'');

        var newScope = $scope.$new();
        $compile(div)(newScope);
        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
        L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);
        return div;
      };
    return ctrl;
  };

  $scope.configureMapTools = function() {
    var modeTool = createLeafeletCustomControl('topright','mapmode');
    $scope.mapControls.custom.push(modeTool);
    $scope.mapControls.custom.push(createLeafeletCustomControl('bottomleft','title'));
    $scope.mapControls.custom.push(createLeafeletCustomControl('bottomright','details'));
    $scope.mapControls.custom.push(createLeafeletCustomControl('topleft','zoom'));
  };

  $scope.configureMapTools();
  $scope.setDefaultTheme = function(themesData){
    selection.theme = themesData[1].name;
    selection.themeObject = themesData[1];
  };

    $scope.mapZoom = function(delta) {
      selection.leafletData.getMap().then(function(map) {
        if (delta > 0) {
          map.zoomIn(delta);
        } else {
          map.zoomOut(Math.abs(delta));
        }
      });
    };

    $scope.mapPan = function(x,y) {
      selection.leafletData.getMap().then(function(map) {
        map.panBy([x,y]);
      });
    };

    $scope.showFeatureOverlays = function() {
      if($scope.layers.overlays.selectionLayer) {
        //$scope.layers.overlays.selectionLayer.style.weight = 3;
        //console.log($scope.geojson);
        $scope.geojson.style.fillColor='red';
        $scope.geojson.style.fillOpacity=0.65;
        $scope.geojson.style.color='black';
        //console.log($scope.layers.overlays.selectionLayer.layerOptions);
        //console.log($scope.layers.overlays.selectionLayer);
      }
    };

    $scope.$on("leafletDirectiveGeoJson.mouseover", function(ev, data) {
      if ($scope.lastFeatureTarget) {
        $scope.lastFeatureTarget.setStyle({
          weight: 1,
          color: 'green',
          fillOpacity: 0.0,
        });
      }
      var layer = data.leafletEvent.target;
      $scope.lastFeatureTarget = layer;
      console.log(layer);
      layer.setStyle({
        weight: 2,
        color: 'black',
        fillColor: 'red',
        fillOpacity: 0.5,
      });
      layer.bringToFront();
      //console.log(data);
    });

  themes.themes().then($scope.setDefaultTheme);
});
