'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the ausEnvApp
 */

angular.module('ausEnvApp')
  .controller('MapCtrl', function ($scope,$route,$interpolate,$compile,$q,$window,
                                   $document,
                                   uiGmapGoogleMapApi,uiGmapIsReady,
                                   selection,configuration,mapmodes,details,colourschemes,
                                   timeseries,spatialFoci) {

    var TRANSPARENT_OPACITY=0.6;
    var BASE_URL='http://dapds00.nci.org.au/thredds';
    var TILE_SIZE=256;
    var TILE_WIDTH=TILE_SIZE;
    var TILE_HEIGHT=TILE_SIZE;
    var proj4 = $window.proj4;
    var webMercator = proj4(proj4.defs('EPSG:3857'));

    var pointToWebMercator = function(pt){
      return webMercator.forward([pt.lng(),pt.lat()]);
    };

    $scope.selection = selection;
    $scope.mapmodes = mapmodes;

    var mapReady = $q.defer();
    $scope.mapReady = mapReady.promise;

    $scope.map = {
      showGrid:true,
      showRegions:true,
      refreshGrid:false,
      refreshRegions:false,
      markerCount:0,
      marker:null,
      events:{
        center_changed:function(maybeMap){
          $scope.checkCentre(maybeMap);
        },
        click:function(map,eventType,event){
          event = event[0];
          selection.clearRegionSelection();
          $scope.selectPoint(event.latLng);
          $scope.$apply();
        }
      },
      options:{
        mapTypeControl:false,
        streetViewControl:true,
        zoomControl:false,
        scaleControl:true,
      }
    };

    $scope.computeTileBounds = function(map,coord,zoom){
      var google = window.google;
      var proj = map.getProjection();
      var zfactor = Math.pow(2, zoom);
      var xScale = TILE_WIDTH/zfactor;
      var yScale = TILE_HEIGHT/zfactor;

      var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * xScale, coord.y * yScale));
      var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * xScale, (coord.y + 1) * yScale));

      top = pointToWebMercator(top);
      bot = pointToWebMercator(bot);

      return [top[0],bot[1],bot[0],top[1]].join(',');
    };

    $scope.layerUrlForZoom = function(settings,zoom){
      for(var i=zoom;i>=1;i--){
        if(settings['urlFor'+i]){
          return settings['urlFor'+i];
        }
      }
      return settings.url;
    };

    $scope.settingsForZoom = function(orig,zoom){
      var result = {};
      var key;
      for(key in orig.layerParams){
        result[key] = orig.layerParams[key];
      }

      for(var i=zoom;i>=1;i--){
        if(orig.zoomSettings && orig.zoomSettings[+i]){
          var overrides = orig.zoomSettings[+i];
          for(key in overrides.layerParams){
            result[key] = overrides.layerParams[key];
          }
          break;
        }
      }

      return result;
    };

    $scope.createImageMapFromWMS = function(layerKey){
      var google = window.google;
      return {
        getTileUrl: function(coord,zoom){
          if(!$scope.theMap){
            return null;
          }

          var settings = $scope.layers.overlays[layerKey];
          if(!settings){
            return null;
          }
          var bbox = $scope.computeTileBounds($scope.theMap,coord,zoom);

          var url = $scope.layerUrlForZoom(settings,zoom) + '&service=WMS&version=1.1.1&request=GetMap';
          url += "&BBOX=" + bbox;      // set bounding box
          url += "&FORMAT=image/png" ; //WMS format
          var layerParams = $scope.settingsForZoom(settings,zoom);
          for(var key in layerParams){
            url += '&'+key+'='+layerParams[key];
          }
          url += "&SRS=EPSG:3857";     //set Web Mercator
          return url;
        },
        tileSize:new google.maps.Size(256,256),
        isPng:true,
        opacity:(selection.imageMode==='opaque')?1.0:TRANSPARENT_OPACITY
      };
    };

    uiGmapGoogleMapApi.then(function(maps) {

      var setMapType = function(newVal){
        if(!newVal){
          newVal = 'ROADMAP';
        }

        newVal = newVal.toUpperCase();
        $scope.map.options.mapTypeId = maps.MapTypeId[newVal];
      };
      $scope.$watch('selection.mapType',setMapType);
      setMapType(selection.mapType);

      $scope.checkCentre = function(map){
        var google = window.google;
        var allowedBounds = new google.maps.LatLngBounds(
             new google.maps.LatLng($scope.bounds.southWest.lat, $scope.bounds.southWest.lng),
             new google.maps.LatLng($scope.bounds.northEast.lat, $scope.bounds.northEast.lng)
        );

        if(allowedBounds.contains(map.getCenter())){
          $scope.lastValidCentre = map.getCenter();
        } else {
          if($scope.lastValidCentre){
            map.panTo($scope.lastValidCentre);
          } else {
            var pt = selection.ozLatLngZm.center;
            map.panTo(pt);
          }
        }
      };

      uiGmapIsReady.promise(1).then(function(instances){
        $scope.theMap = instances[0].map;
        $scope.map.showGrid=true;
        $scope.theMap.data.setStyle($scope.geoJsonStyling);
        $scope.theMap.data.addListener('click', $scope.polygonSelected);
        mapReady.resolve();
      });
      $scope.gridData = $scope.createImageMapFromWMS('aWMS');
      $scope.regionImageData = $scope.createImageMapFromWMS('selectionLayer');
    });

    $scope.mapControls = {
      custom:[]
    };

    angular.extend($scope, {
      bounds: {
        northEast: {
            lat: selection.ozLatLngMapBounds.north,
            lng: selection.ozLatLngMapBounds.east,
        },
        southWest: {
          lat: selection.ozLatLngMapBounds.south,
          lng: selection.ozLatLngMapBounds.west
        }
      },
      layers: {
        overlays: {
        }
      },

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
      geoJsonLayer: null,
      geojson: null

    });

    $scope.polygonFillColour = function(feature) {
      if(!$scope.polygonMapping || (selection.mapMode!==$scope.mapmodes.region)) {
        return null;
      }
      var key = feature.getProperty($scope.selection.regionType.keyField);
      if(!key) {
        return null;
      }

      var vals = $scope.polygonMapping.values['PlaceIndex'+key];
      if(!vals) {
        return null;
      }

      var idx = $scope.polygonMapping.values.columnNames.indexOf(''+$scope.selection.year);
      var val = vals[idx];
//      var range = themes.colourRange($scope.selection.selectedLayer).split(',').map(function(v){
//        return +v;
//      });
      var range = $scope.polygonMapping.dataRange;
      var point = (val-range[0])/(range[1]-range[0]);
      var pos = Math.round(point*($scope.polygonMapping.colours.length-1));
      var selectedColour = $scope.polygonMapping.colours[pos];

      return selectedColour;
    };

    $scope.highlightPolygon = function(feature){
      return (selection.selectionMode==='region')&&
             selection.selectedRegion &&
             (feature.getProperty(selection.regionType.labelField)===selection.selectedRegion.name);
    };

    $scope.geoJsonStyling = function(feature) {
      var style = {
        strokeWeight:0,
        strokeOpacity:0,
        fillColor:$scope.polygonFillColour(feature) || 'unfilled',
        fillOpacity:1,
        color:'#000'
      };

      if(style.fillColor==='unfilled') {
        style.fillColor = '#000';
        style.fillOpacity = 0;
      } else {
        style.strokeWeight = 1;
        style.strokeOpacity = 1;
      }

      if($scope.highlightPolygon(feature)){
        style.strokeWeight=6;
        style.strokeOpacity=1.0;
        style.strokeColor='#FF6';
      }

      return style;
    };

    $scope.selectFeature = function(feature) {
      if(selection.regionType.hide){
        return;
      }

      selection.selectRegionByName(feature.getProperty(selection.regionType.labelField),selection.regionType.name);
    };

    $scope.polygonSelected = function(evt) {
      $scope.selectFeature(evt.feature);
      $scope.selectPoint(evt.latLng);
    };

    $scope.fetchPolygonData = function() {
      var result = $q.defer();
      $q.all([details.getPolygonFillData(),colourschemes.coloursFor(selection.selectedLayer)]).then(function(data){
        result.resolve(data);
      });

      return result.promise;
    };

    var styleApplicationsPending=0;
    $scope.updateStyling = function(){
      var doUpdateStyles = function(){
        if(!styleApplicationsPending){
          styleApplicationsPending++;
          $scope.mapReady.then(function(){
            styleApplicationsPending--;
            $scope.theMap.data.setStyle($scope.geoJsonStyling);
          });
        }
      };

      if($scope.selection.mapMode===$scope.mapmodes.region) {

        $scope.fetchPolygonData().then(function(data){
          if($scope.selection.mapMode!==$scope.mapmodes.region) {
            doUpdateStyles();

            return;
          }

          $scope.polygonMapping = {
            colours: data[1],
            values: data[0]
          };
          if((selection.dataMode==='delta')&&selection.selectedLayer.delta) {
            $scope.polygonMapping.values = colourschemes.annualDelta($scope.polygonMapping.values);
          }
          $scope.polygonMapping.dataRange = colourschemes.dataRange($scope.polygonMapping.values,$scope.selection.year);
          doUpdateStyles();
        });
      }

      doUpdateStyles();
    };

    $scope.updateDropPins = function(){
      $scope.map.marker = null;
      $scope.map.markerCount++;
      if(selection.useSelectedPoint()){

        $scope.map.marker = {
          id:$scope.map.markerCount,
          coords:{
            latitude:selection.selectedPoint.lat(),
            longitude:selection.selectedPoint.lng(),
          }
        };
      }
    };

    ['year','selectedRegion','selectionMode','selectedLayer','regionType','mapMode','dataMode'].forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.updateStyling);
    });

    ['selectedPoint','selectionMode'].forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.updateDropPins);
    });

  $scope.$watch('selection.themeObject',function(newVal){
    if(!newVal){
      return;
    }

    $scope.clearView();
  });

  $scope.$watch('selection.regionType',function(newVal){
    $scope.geojson = {};

    $scope.map.refreshRegions = !$scope.map.refreshRegions;

    if(!newVal){
      return;
    }

    var wmsLayer = (newVal.sourceWMS||newVal.source);
    if(wmsLayer&&spatialFoci.show(newVal)){
      // Show as image
      $scope.layers.overlays.selectionLayer = {
        name: newVal.name,
        url:selection.WMS_SERVER+'/wald/wms?',
        type:'wms',
        visible:true,
        doRefresh:true,
        layerParams:{
          version:'1.1.1',
          format:'image/png',
          layers:'wald:'+wmsLayer,
          transparent:true,
          zIndex:50,
          showOnSelector: false,
          width:TILE_WIDTH,
          height:TILE_HEIGHT,
          tiled:true
        }
      };
    }
    if(!newVal.jsonData){
      delete $scope.layers.overlays.selectionHiddenLayer;
      return;
    }
    newVal.jsonData().then(function(resp){
      $scope.geojson = resp;

      $scope.mapReady.then(function(){
        $scope.theMap.data.forEach(function(f){$scope.theMap.data.remove(f);});
        $scope.theMap.data.addGeoJson($scope.geojson);
        $scope.layers.overlays.selectionHiddenLayer = {
          name: 'hidden',
          type:'custom',
          layer:function(){
            $scope.geoJsonLayer = L.geoJson($scope.geojson,{
              style:$scope.geoJsonStyling,
              onEachFeature:function(feature,layer){
                layer.on({
                  click: $scope.polygonSelected
                });
              }
            });
            return $scope.geoJsonLayer;
          },
          visible:true,
          doRefresh:true,
          layerParams:{
            showOnSelector: false
          }
        };
      });

//        data:resp,
//        style:{
//          weight:1,
//          color:'green',
//          //fillColor:'red',
//          fillOpacity:0,
//        }
//      };
    });
  });

  $scope.clearView = function() {
    if($scope.layers.overlays.aWMS) {
      delete $scope.layers.overlays.aWMS;
    }
  };

  $scope.showWMS = function(){
    var layer = selection.selectedLayer;
    if(!layer){
      return;
    }

    $scope.map.refreshGrid = !$scope.map.refreshGrid;
    $scope.map.refreshRegions = !$scope.map.refreshRegions;

    if(!$scope.selection.mapModesAvailable()) {
      selection.mapMode = mapmodes.grid;
    }

    if(selection.mapMode!==mapmodes.grid) {
      if($scope.layers.overlays.aWMS) {
        delete $scope.layers.overlays.aWMS;
      }
      return;
    }

    var prefix = '';
    var keys = ['time','variable','url','colorscalerange',
                'belowmincolor','abovemaxcolor','palette','logscale',
                'transparent','bgcolor','zooms'];

    var settings = {};
    keys.forEach(function(k){settings[k] = layer[k];});
    if(layer[selection.dataMode]) {
      if(selection.dataMode==='delta') {
        prefix = 'Change in ';
      }
      keys.forEach(function(k){
        if(layer[selection.dataMode][k]!==undefined) {
          settings[k] = layer[selection.dataMode][k];
        }
      });
    }
    $scope.layers.overlays.aWMS = $scope.selection.makeLayer();

    var fn = $interpolate(settings.url)(selection);

    var makeWMSUrl = function(u){
      return BASE_URL + '/wms/' + u +'?';
    }

    $scope.layers.overlays.aWMS.name = prefix + layer.title;
    $scope.layers.overlays.aWMS.url = makeWMSUrl(fn);

    if(settings.zooms){
      for(var zm in settings.zooms){
        var u = $interpolate(settings.zooms[zm].url)(selection);
        $scope.layers.overlays.aWMS.zoomSettings = $scope.layers.overlays.aWMS.zoomSettings || {};
        var overrides = {
          layerParams:{}
        };

        $scope.layers.overlays.aWMS['urlFor'+zm] = makeWMSUrl(u);
        for(var key in settings.zooms[zm]){
          if(key==='url'){
            continue;
          }
          overrides.layerParams[key] = settings.zooms[zm][key];
        }

        $scope.layers.overlays.aWMS.zoomSettings[+zm] = overrides;
      }
    }

    $scope.layers.overlays.aWMS.layerParams.time = $interpolate(settings.time)(selection);
    $scope.layers.overlays.aWMS.layerParams.layers = settings.variable;
    $scope.layers.overlays.aWMS.layerParams.colorscalerange = settings.colorscalerange;
    keys = ['transparent','bgcolor',
            'belowmincolor','abovemaxcolor','logscale'];
    keys.forEach(function(key){
      if(settings[key] !== undefined) {
        $scope.layers.overlays.aWMS.layerParams[key] = settings[key];
      }
    });
    if(settings.palette) {
      $scope.layers.overlays.aWMS.layerParams.styles = 'boxfill/'+settings.palette;
    }
    $scope.layers.overlays.aWMS.layerParams.showOnSelector = false;
    colourschemes.coloursFor(selection.selectedLayer).then(function(colours){
      $scope.layers.overlays.aWMS.doRefresh = true;
      $scope.layers.overlays.aWMS.layerParams.numcolorbands = colours.length;
    });
  };

  ['year','selectedLayer','dataMode','mapMode'].forEach(function(prop){
    $scope.$watch('selection.'+prop,$scope.showWMS);
  });

  $scope.$watch('selection.imageMode',function(){
    if(!$scope.gridData){
      return;
    }
    $scope.gridData.opacity=(selection.imageMode==='opaque')?1.0:TRANSPARENT_OPACITY;
    $scope.map.refreshGrid = !$scope.map.refreshGrid;
  });

  $scope.setDefaultTheme = function(themesData){
    selection.selectTheme(themesData[0]);
  };

  $scope.showFeatureOverlays = function() {
    if($scope.layers.overlays.selectionLayer) {
      //$scope.layers.overlays.selectionLayer.style.weight = 3;
      $scope.geojson.style.fillColor='red';
      $scope.geojson.style.fillOpacity=0.65;
      $scope.geojson.style.color='black';
    }
  };

  configuration.themes().then(function(themeData){
    if(!$scope.selection.selectedLayer){
      $scope.setDefaultTheme(themeData); // Move to app startup
    }
  });

  $scope.selectPoint = function(latlng){
    selection.selectedPoint = latlng;
  };

  $scope.shareLinkFacebook = function(event){
    event.preventDefault();

    console.log('here');
    $window.open("https://www.facebook.com/sharer/sharer.php?u="+escape($window.location.href)+"&t="+$document.title, '',
                'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
  };

});
