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
                                   $document,$timeout,
                                   uiGmapGoogleMapApi,uiGmapIsReady,
                                   selection,configuration,mapmodes,details,colourschemes,
                                   timeseries,spatialFoci,datamodes,imagemodes,googleMapsWMS) {

    var TRANSPARENT_OPACITY=0.6;
    var BASE_URL='http://dapds00.nci.org.au/thredds';

    /**
     * @constructor
     * @implements {google.maps.MapType}
     */
    function PlainMapType(colour,size,name) {
      this.colour = colour;
      this.tileSize=size;
      this.name = name;
      this.alt = name;
    }

    PlainMapType.prototype.maxZoom = 19;
    PlainMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
      var div = ownerDocument.createElement('div');
      //div.innerHTML = coord;
      div.style.width = this.tileSize.width+'px';
      div.style.height = this.tileSize.height+'px';
      div.style.fontSize = '10';
      div.style.borderStyle = 'solid';
      div.style.borderWidth = '1px';
      div.style.borderColor = this.colour;
      div.style.backgroundColor = this.colour;
      return div;
    };

    $scope.selection = selection;
    $scope.mapmodes = mapmodes;

    var mapReady = $q.defer();
    $scope.mapReady = mapReady.promise;
    $scope.map = {
      showGrid:true,
      showRegions:true,
      refreshGrid:false,
      refreshRegions:0,
      markerCount:0,
      marker:null,
      events:{
        center_changed:function(maybeMap){
          $scope.checkCentre(maybeMap);
        },
        // click:function(map,eventType,event){
        //   event = event[0];
        //   selection.clearRegionSelection();
        //   $scope.selectPoint(event.latLng);
        //   $scope.$apply();
        // }//,
        // mousemove:function(map,eventType,event,x,y,z){
        //   console.log('map',map);
        //   console.log('eventType',eventType);
        //   console.log('event',event);
        //   console.log('xyz',x,y,z);
        // }
      },
      options:{
        fullscreenControl: false,
        minZoom:3,
        mapTypeControl:false,
        streetViewControl:true,
        zoomControl:false,
        scaleControl:true
      }
    };

    $scope.layerUrlForZoom = function(settings,zoom){
      if(!settings){
        return null;
      }
      for(var i=zoom;i>=1;i--){
        if(settings['urlFor'+i]){
          return settings['urlFor'+i];
        }
      }
      return settings.url;
    };

    $scope.settingsForZoom = function(orig,zoom){
      if(!orig){
        return null;
      }

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
      return googleMapsWMS.buildImageMap(
        function(){return $scope.theMap;},
        function(zoom){return $scope.layerUrlForZoom($scope.layers.overlays[layerKey],zoom);},
        function(zoom){return $scope.settingsForZoom($scope.layers.overlays[layerKey],zoom);},
        function(){return (selection.imageMode===imagemodes.opaque)?1.0:TRANSPARENT_OPACITY;});
    };

    uiGmapGoogleMapApi.then(function(maps) {

      var setMapType = function(newVal){
        if(!newVal){
          newVal = 'ROADMAP';
        }

        newVal = newVal.toUpperCase();
        $scope.map.options.mapTypeId = maps.MapTypeId[newVal] || newVal;
      };
      $scope.$watch('selection.mapType',setMapType);
      setMapType(selection.mapType);

      $scope.map.options.streetViewControlOptions = {
        position: maps.ControlPosition.BOTTOM_RIGHT
      };

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
        $scope.map.showGrid=(selection.mapMode===mapmodes.grid);
        $scope.theMap.data.setStyle($scope.geoJsonStyling);
        // $scope.theMap.data.addListener('click', $scope.polygonSelected);

        var tileSize = new google.maps.Size(256, 256);
        $scope.theMap.mapTypes.set('WHITE',new PlainMapType('#FFF',tileSize,'White'));
        $scope.theMap.mapTypes.set('BLACK',new PlainMapType('#000',tileSize,'Black'));
        $scope.setupVectorTileLayer();
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

    $scope.polygonFillColour = function(feature,idx) {
      if(!$scope.polygonMapping || (selection.mapMode===$scope.mapmodes.grid)) {
        return null;
      }
      // var key = feature.getProperty($scope.selection.regionType.keyField);
      // var key = feature[$scope.selection.regionType.keyField];
      // if(!key) {
      //   return null;
      // }

      var vals = $scope.polygonMapping.values['PlaceIndex'+idx];
      if(!vals) {
        return null;
      }

      var columnName = selection.selectedLayer.summaryColumn || $scope.selection.year;
      var idx = Math.max($scope.polygonMapping.values.columnNames.indexOf(''+columnName),
                         $scope.polygonMapping.values.columnNames.indexOf(+columnName));

      var val = vals[idx];
//      var range = themes.colourRange($scope.selection.selectedLayer).split(',').map(function(v){
//        return +v;
//      });

      if(selection.dataModeConfig()==='rank'){
        return $scope.rankColourScale(val);
      }
      return $scope.colourScaleLinear(val);
    };

    $scope.rankColourScale = function(val){
      var idx = 0;
      if(val >= 10){
        idx = 6;
      } else if(val > 9){
        idx = 5;
      } else if(val >= 8){
        idx = 4;
      } else if(val > 2) {
        idx = 3;
      } else if(val > 1) {
        idx = 2;
      } else if(val > 0) {
        idx = 1;
      }

      return $scope.polygonMapping.colours[idx];
    };

    $scope.colourScaleLinear = function(val){
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

    $scope.cursorToUse = function(){
      return (selection.selectionMode==='point')?'crosshair':null;
    };

    $scope.geoJsonStyling = function(feature) {
      var style = {
        strokeWeight:0,
        strokeOpacity:0,
        fillColor:$scope.polygonFillColour(feature) || 'unfilled',
        fillOpacity:$scope.mapOpacity(),
        color:'#000',
        cursor: $scope.cursorToUse()
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
            $scope.theMap.setOptions({draggableCursor:$scope.cursorToUse()});

            $scope.setupVectorTileLayer();
          });
        }
      };

      if($scope.selection.mapMode===$scope.mapmodes.region) {
        $scope.polygonMapping = null;

        $scope.fetchPolygonData().then(function(data){
          if($scope.selection.mapMode!==$scope.mapmodes.region) {
            doUpdateStyles();

            return;
          }

          $scope.polygonMapping = {
            colours: data[1],
            values: data[0]
          };
          var deltaMode=selection.deltaMode();
          if(deltaMode){
            $scope.polygonMapping.values = colourschemes.annualDelta($scope.polygonMapping.values);
          }

          if(selection.dataModeConfig()==='rank'){
            $scope.polygonMapping.dataRange = [0,10];
          } else {
            var columnName = selection.selectedLayer.summaryColumn || $scope.selection.year;
            $scope.polygonMapping.dataRange = colourschemes.dataRange($scope.polygonMapping.values,columnName,deltaMode);
          }

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

    $scope.vectorFillStyles = function(layer,features){
      var colorExpression = '#d8e8c8';
      var opacity = 0.0;
      var key = $scope.selection.regionType.keyField;
      if($scope.polygonMapping && (selection.mapMode!==$scope.mapmodes.grid)) {
        opacity = $scope.mapOpacity();
        colorExpression = [
          'match',
          ['get',key]
        ];
        // var colourMap = {};
        features.forEach(function(f,idx){
          var keyVal = f[key];
          var colour = $scope.polygonFillColour(f,idx+1);

          if(colour){
            colorExpression.push(keyVal,colour);
          }

          // if(!colourMap[colour]){
          //   colourMap[colour]=[];
          // }
          // colourMap[colour].push(keyVal);
        });
        // Object.keys(colourMap).forEach(function(col){
        //   colorExpression.push(colourMap[col],col);
        // });
        colorExpression.push("rgba(0,0,0,0)");
      }

      return [
        {
          id: "region",
          type: "fill",
          source: "openmaptiles",
          "source-layer": layer.source,
          filter: ["all"],
          paint: {
            "fill-color": colorExpression,
            "fill-opacity": opacity,
            "fill-outline-color": "rgba(95, 208, 100, 1)"
          }
        }
      ];
    };

    $scope.vectorStatus = 0;
    $scope.setupVectorTileLayer = function(){
      if(!window.google||!$scope.theMap){
        console.log('maps not ready');
        return;
      }

      if($scope.vectorTileData){
        $scope.vectorTileData.removeFromMap($scope.theMap);
        $scope.vectorTileData = null;
      }

      if(!$scope.polygonMapping && (selection.mapMode!==$scope.mapmodes.grid)) {
        console.log('Need polygon mapping data');
        return;
      }

      $scope.map.refreshRegions = $scope.map.refreshRegions + 1;

      // uiGmapGoogleMapApi.then(function(){
      var layer = selection.regionType;
      layer.jsonData().then(function(features){
        var vectorZooms = [1,2,3,4,5,6,7,8,9,10];

        var layers = $scope.vectorFillStyles(layer,features)
        layers.push({
          id: "region_outline",
          type: "line",
          source: "openmaptiles",
          "source-layer": layer.source,
          filter: ["all"],
          layout: {},
          paint: {
            //                    "line-dasharray": [1, 1.5],
            "line-color": "rgba(128, 128, 128, 1)",
            "line-opacity": 1,
            "line-width": 1
          }
        });

        if(selection.selectedRegion){
          layers.push(
            {
              id: "region_selected",
              type: "line",
              source: "openmaptiles",
              "source-layer": layer.source,
              filter: ["==", layer.keyField, selection.selectedRegion.feature[layer.keyField]],
              layout: {},
              paint: {
                //                    "line-dasharray": [1, 1.5],
                "line-color": "#FF6",
                "line-opacity": 1,
                "line-width": 3
              }
            });
        }

        $timeout(function(){
          if($scope.vectorTileData){
            return;
          }

          $scope.map.refreshRegions = $scope.map.refreshRegions + 1;
          $scope.vectorTileData = new MapboxGoogleOverlay({
            minZoom: 1,
            maxZoom: 21,
            style: {
              version: 8,
              name: "OSM Liberty",
              metadata: {
                "mapbox:type": "template"
              },
              sources: {
                openmaptiles: {
                  type: "vector",
                  tiles: [
                    window.location.origin + "/vector-tiles/" + layer.source + "/{z}/{x}/{y}.pbf",
                  ],
                  name: "OpenMapTiles",
                  // minzoom: 1,
                  // maxzoom: 21
                }
              },
              // sprite:
              //   "https://rawgit.com/lukasmartinelli/osm-liberty/gh-pages/sprites/osm-liberty",
              // glyphs:
              //   "https://orangemug.github.io/font-glyphs/glyphs/{fontstack}/{range}.pbf",
              layers: layers,
              id: "osm-liberty"
            },
            availableZooms: { openmaptiles: vectorZooms }, // 1,2,3,4,5,6,7,8,9,10,11
            mousemoveSources: ['openmaptiles'],// Object.keys({ openmaptiles: vectorZooms })
            clickSources: ['openmaptiles']// Object.keys({ openmaptiles: vectorZooms })
          });

          $scope.vectorTileData.addToMap($scope.theMap);
          $scope.vectorTileData.on(
            'click',
            function (info) {
              console.log(info);
              var f = info && info.features && info.features[layer.source];
              f = f && f[0];

              if (f && !selection.regionType.hide) {
                selection.selectRegionByName(f[selection.regionType.labelField], selection.regionType.name);
              } else {
                $timeout(function(){
                  selection.clearRegionSelection();
                });
              }

              $scope.selectPoint(info.mouseEvent.latLng);
              // $scope.$apply();
            }
          );

          // $timeout(function(){
          //   $scope.vectorTileData.addToMap($scope.theMap);
          //   $scope.vectorTileData.on(
          //     "click",
          //     function (info) {
          //       console.log(info);
          //       var f = info && info.features && info.features[layer.source];
          //       f = f && f[0];

          //       if (f && !selection.regionType.hide) {
          //         selection.selectRegionByName(f[selection.regionType.labelField], selection.regionType.name);
          //       }

          //       $scope.selectPoint(info.mouseEvent.latLng);
          //     }
          //   );
          // },10);
        },0);
      });
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

  ['year','selectedRegion','selectionMode','selectedLayer','regionType','mapMode','dataMode','selectedPoint'].forEach(function(prop){
    $scope.$watch('selection.'+prop,function(){
      var newVal = selection[prop];
      if(newVal&&newVal.title){
        newVal = newVal.title;
      }
      if(newVal&&newVal.name){
        newVal = newVal.name;
      }

      if(!window.ga){
        console.log('Cannot log event. ga not loaded');
        return;
      }
      ga('send', 'event', 'selection', prop, (newVal||'').toString());
    });
  });

  $scope.$watch('selection.regionType',function(newVal,oldVal){
    // $scope.geojson = {};

    $scope.map.refreshRegions = $scope.map.refreshRegions + 1;

    if(!newVal){
      return;
    }

    if(newVal!==oldVal){
      selection.initialisePolygons(newVal);
    }

    // var wmsLayer = (newVal.sourceWMS||newVal.source);
    // if(wmsLayer&&spatialFoci.show(newVal)){
    //   // Show as image
    //   $scope.layers.overlays.selectionLayer = {
    //     name: newVal.name,
    //     url:selection.WMS_SERVER+'/wald/wms?',
    //     type:'wms',
    //     visible:true,
    //     doRefresh:true,
    //     layerParams:{
    //       version:'1.1.1',
    //       format:'image/png',
    //       layers:'wald:'+wmsLayer,
    //       transparent:true,
    //       zIndex:50,
    //       showOnSelector: false,
    //       width:googleMapsWMS.TILE_WIDTH,
    //       height:googleMapsWMS.TILE_HEIGHT,
    //       tiled:true
    //     }
    //   };
    // }

    // $scope.setupVectorTileLayer();

    if(!newVal.jsonData){
      delete $scope.layers.overlays.selectionHiddenLayer;
      return;
    }
    newVal.jsonData().then(function(resp){
      // $scope.geojson = resp;

      // $scope.mapReady.then(function(){
      //   // $scope.theMap.data.forEach(function(f){$scope.theMap.data.remove(f);});
      //   // $scope.theMap.data.addGeoJson($scope.geojson);
      //   $scope.layers.overlays.selectionHiddenLayer = {
      //     name: 'hidden',
      //     type:'custom',
      //     layer:function(){
      //       $scope.geoJsonLayer = L.geoJson($scope.geojson,{
      //         style:$scope.geoJsonStyling,
      //         onEachFeature:function(feature,layer){
      //           layer.on({
      //             click: $scope.polygonSelected
      //           });
      //         }
      //       });
      //       return $scope.geoJsonLayer;
      //     },
      //     visible:true,
      //     doRefresh:true,
      //     layerParams:{
      //       showOnSelector: false
      //     }
      //   };
      // });
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
    $scope.map.refreshRegions = $scope.map.refreshRegions + 1;
    if(!$scope.selection.mapModesAvailable()) {
      if(selection.mapMode!==mapmodes.grid){
        selection.mapMode = mapmodes.grid;
        $scope.map.refreshGrid = !$scope.map.refreshGrid;
      }
    }


    if(layer.missingYears && (layer.missingYears.indexOf(selection.year)>=0)){
      $scope.noDataMessage = (layer.source||layer.title) + ' not available for ' + selection.year;
    } else {
      $scope.noDataMessage = null;
    }

    if(selection.mapMode!==mapmodes.grid) {
      if($scope.layers.overlays.aWMS) {
        delete $scope.layers.overlays.aWMS;
      }
      $scope.map.showGrid = false;
      return;
    }

    if(!$scope.map.showGrid){
      $scope.map.showGrid = true;
      $scope.map.refreshGrid = !$scope.map.refreshGrid;
    }

    var prefix = '';
    if(layer[selection.dataModeConfig()]) {
      if(selection.dataMode===datamodes.delta) {
        prefix = 'Change in ';
      } else if(selection.dataMode===datamodes.rank){
        prefix = 'Rank of ';
      }
    }

    var settings = selection.mapSettings(layer);
    $scope.layers.overlays.aWMS = $scope.selection.makeLayer(!layer.noDefaultParameters);

    var fn = $interpolate(settings.url)(selection);

    var makeWMSUrl = function(u){
      if(!(u.startsWith('http://')||u.startsWith('https://'))){
        u = BASE_URL + '/wms/' + u;
      }
      if(!u.endsWith('?')){
        u += '?'
      }
      return u;
    };

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

    if(settings.time){
      $scope.layers.overlays.aWMS.layerParams.time = $interpolate(settings.time)(selection);
    }

    $scope.layers.overlays.aWMS.layerParams.layers = settings.variable;
    if(settings.colorscalerange){
      $scope.layers.overlays.aWMS.layerParams.colorscalerange = settings.colorscalerange;
    }

    var keys = ['transparent','bgcolor',
            'belowmincolor','abovemaxcolor','logscale'];
    keys.forEach(function(key){
      if(settings[key] !== undefined) {
        $scope.layers.overlays.aWMS.layerParams[key] = settings[key];
      }
    });
    if(settings.palette) {
      var palette = settings.palette.grid||settings.palette;
      palette = palette[selection.dataModeConfig()]||palette;
      $scope.layers.overlays.aWMS.layerParams.styles = 'boxfill/'+palette;
    }
    //$scope.layers.overlays.aWMS.layerParams.showOnSelector = false;
    colourschemes.coloursFor(selection.selectedLayer).then(function(colours){
      $scope.layers.overlays.aWMS.doRefresh = true;
      $scope.layers.overlays.aWMS.layerParams.numcolorbands = colours.length;
    });
  };

  ['year','selectedLayer','dataMode','mapMode'].forEach(function(prop){
    $scope.$watch('selection.'+prop,$scope.showWMS);
  });

  $scope.mapOpacity = function(){
    return (selection.imageMode===imagemodes.opaque)?1.0:TRANSPARENT_OPACITY;
  };

  $scope.$watch('selection.mapMode',function(){
    if((selection.mapMode===mapmodes.grid)&&
       (selection.dataMode===datamodes.rank)){
      selection.dataMode=datamodes.actual;
    }
  });

  $scope.$watch('selection.dataMode',function(){
    if((selection.mapMode===mapmodes.grid)&&
       (selection.dataMode===datamodes.rank)){
      selection.mapMode=mapmodes.region;
    }
  });

  $scope.$watch('selection.imageMode',function(){
    if(!$scope.gridData){
      return;
    }

    if(selection.mapMode === mapmodes.grid){
      $scope.gridData.opacity=$scope.mapOpacity();
      $scope.map.refreshGrid = !$scope.map.refreshGrid;
      $scope.map.refreshRegions = $scope.map.refreshRegions + 1;
    } else {
      $scope.updateStyling();
    }
  });

  $scope.setDefaultTheme = function(themesData){
    var defaultTheme = themesData.filter(function(t){return t.default;})[0] || themesData[0];
    selection.selectTheme(defaultTheme);
  };

  configuration.themes().then(function(themeData){
    if(!$scope.selection.selectedLayer){
      $scope.setDefaultTheme(themeData); // Move to app startup
    }
  });

  $scope.selectPoint = function(latlng){
    selection.selectedPoint = latlng;
  };

});
