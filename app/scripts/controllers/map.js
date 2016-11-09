'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the ausEnvApp
 */

angular.module('ausEnvApp')
  .controller('MapCtrl', function ($scope,$route,$interpolate,$compile,$q,
                                   selection,themes,mapmodes,details,colourschemes,
                                   timeseries,spatialFoci) {

    $scope.selection = selection;
    $scope.mapmodes = mapmodes;

    $scope.mapControls = {
      custom:[]
    };

    $scope.mapMarkers = [];

    angular.extend($scope, {
      defaults: {
        crs: L.CRS.EPSG4326,
        attributionControl: false,
        zoomControl:false,
        maxZoom: 12,
        minZoom: 2,
      }, //defaults

      bounds: {
        northEast: {
            lat: -0,
            lng: 175
        },
        southWest: {
          lat: -55,
          lng: 90
        }
      },
      layers: {
        baselayers: {
        },
        overlays: {
          mask: {
            name: 'Ocean Mask',
            url: selection.WMS_SERVER + '/public/wms?',
            type: 'wms',
            visible: true,
            layerParams: {
              version: '1.1.1',
              format: 'image/png',
              layers: 'public:water_polygons_simple25',
              transparent: true,
              showOnSelector: false,
              zIndex:100,
              tiled:true
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
      geoJsonLayer: null,
      geojson: null

    });

    $scope.$on('leafletDirectiveMap.click', function(_, args){
      selection.clearRegionSelection();
      $scope.selectPoint(null);//args.leafletEvent.latlng);
    });

    $scope.$on('leafletDirectiveGeoJson.click',function(event,args){
      $scope.selectPoint(args.leafletEvent.latlng);
      $scope.selectFeature(args.leafletEvent.target.feature);
    });

    $scope.polygonFillColour = function(feature) {
      if(!$scope.polygonMapping || (selection.mapMode!==$scope.mapmodes.region)) {
        return null;
      }
      var key = feature.properties[$scope.selection.regionType.keyField];
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
      return selection.selectedRegion &&
             (feature===selection.selectedRegion.feature);
    };

    $scope.geoJsonStyling = function(feature) {
      var style = {
        weight:0,
        strokeOpacity:0,
        fillColor:$scope.polygonFillColour(feature) || 'unfilled',
        fillOpacity:1,
        color:'#000'
      };

      if(style.fillColor==='unfilled') {
        style.fillColor = 'black';
        style.fillOpacity = 0;
      } else {
        style.weight = 1;
        style.strokeOpacity = 1;
      }

      if($scope.highlightPolygon(feature)){
        style.weight=6;
        style.strokeOpacity=0.5;
        style.color='#FF6';
      }

      return style;
    };

    $scope.selectFeature = function(feature) {
      if(selection.regionType.hide){
        return;
      }

      selection.selectRegionByName(feature.properties[selection.regionType.labelField],selection.regionType.name);
    };

    $scope.polygonSelected = function(evt) {
      L.DomEvent.stopPropagation(evt);
      $scope.selectFeature(evt.target.feature);
      $scope.selectPoint(evt.latlng);
    };

    $scope.fetchPolygonData = function() {
      var result = $q.defer();
      $q.all([details.getPolygonFillData(),colourschemes.coloursFor(selection.selectedLayer)]).then(function(data){
        result.resolve(data);
      });

      return result.promise;
    };

    $scope.updateStyling = function(){
      var doUpdateStyles = function(){
        if($scope.geoJsonLayer){
          $scope.geoJsonLayer.setStyle($scope.geoJsonStyling);
        }
      };

      var resetPolygonColours = function() {
        $scope.polygonColours = null;
      };

      if($scope.selection.mapMode===$scope.mapmodes.region) {

        $scope.fetchPolygonData().then(function(data){
          if($scope.selection.mapMode!==$scope.mapmodes.region) {
            resetPolygonColours();
            doUpdateStyles();

            return;
          }

          $scope.polygonMapping = {
            colours: data[1],
            values: data[0]
          };
          if((selection.dataMode==='delta')&&selection.selectedLayer.delta) {
            $scope.polygonMapping.values = JSON.parse(JSON.stringify($scope.polygonMapping.values));
            var copy = $scope.polygonMapping.values;
            copy.columnNames.shift();
            Object.keys(copy)
              .filter(function(k){return k.startsWith('PlaceIndex');})
              .forEach(function(k){
                var prev = copy[k].slice(); prev.pop();
                var curr = copy[k].slice(); curr.shift();
                var diff = [];
                for(var i=0; i<prev.length;i++){
                  diff.push(curr[i]-prev[i]);
                }
                copy[k] = diff;
              });
          }
          $scope.polygonMapping.dataRange = colourschemes.dataRange($scope.polygonMapping,$scope.selection.year);
          $scope.colourScaleRange = $scope.polygonMapping.dataRange;
          $scope.updateColourScheme();
          doUpdateStyles();
        });
      } else {
        resetPolygonColours();
      }

      doUpdateStyles();
    };

    $scope.updateMapTitles = function() {
      $scope.mapTitle = null;
      $scope.mapDescription = null;
      $scope.mapUnits = null;
      $scope.mapTimePeriod = null;
      if(!selection.selectedLayer) {
        return;
      }

      if(selection.selectedLayer.delta && (selection.dataMode==='delta')){
        $scope.mapTimePeriod = +(selection.year-1) + ' to ' + selection.year;
      } else {
        $scope.mapTimePeriod = +selection.year;
      }

      $scope.mapTitle = selection.selectedLayerTitle();
      $scope.mapDescription = selection.selectedLayer.description;
      $scope.mapUnits = selection.selectedLayer.units;

      if(!selection.selectedLayer.disablePolygons) {
        $scope.fetchPolygonData().then(function(data){
          data = data[0];
          if(!data){
            return;
          }
          if($scope.selection.mapMode===$scope.mapmodes.region) {
            $scope.mapTitle = selection.selectedLayerTitle(data.Title);
          }
          $scope.mapDescription = $scope.mapDescription || data.Description;
          $scope.mapUnits = $scope.mapUnits || details.unitsText(data.Units);
        });
      }
    };

    $scope.updateDropPins = function(){
      $scope.mapMarkers = [];
      if(selection.useSelectedPoint()){
        $scope.mapMarkers.push(selection.selectedPoint);
      }
    };

    ['selectedRegion','selectedLayer','regionType','mapMode','dataMode'].forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.updateStyling);
    });

    ['selectedLayer','regionType','mapMode','dataMode'].forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.updateMapTitles);
    });

    ['selectedPoint','regionType'].forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.updateDropPins);
    });

  $scope.$watch('selection.themeObject',function(newVal){
    if(!newVal){
      return;
    }

    $scope.clearView();
  });

  $scope.$watch('selection.regionType',function(newVal){
    if($scope.layers.overlays.selectionLayer){
      delete $scope.layers.overlays.selectionLayer;
    }
    $scope.geojson = {};

    if(!newVal){
      return;
    }

    var wmsLayer = (newVal.sourceWMS||newVal.source);
    if(wmsLayer&&spatialFoci.show(newVal)){
  //    // +++ Causing stack overflows??? Due to leaflet events perhaps?
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

//    if($scope.layers.overlays.json) {
//      delete $scope.layers.overlays.json;
//    }
  };

  $scope.showWMS = function(){
    var layer = selection.selectedLayer;
    if(!layer){
      return;
    }

    if(!$scope.mapModesAvailable()) {
      selection.mapMode = mapmodes.grid;
    }

    if(selection.mapMode!==mapmodes.grid) {
      if($scope.layers.overlays.aWMS) {
        delete $scope.layers.overlays.aWMS;
      }
      return;
    }

    $scope.colourScaleRange = selection.selectedLayer.colorscalerange;
    if(selection.selectedLayer[selection.dataMode]) {
      $scope.colourScaleRange = selection.selectedLayer[selection.dataMode].colorscalerange || $scope.colourScaleRange;
    }
    $scope.colourScaleRange = $scope.colourScaleRange.split(',').map(function(e){return +e;});

    var prefix = '';
    var keys = ['time','variable','url','colorscalerange',
                'belowmincolor','abovemaxcolor','palette','logscale',
                'transparent','bgcolor'];

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

    $scope.updateColourScheme(settings.logscale);

    var fn = $interpolate(settings.url)(selection);
    var BASE_URL='http://dapds00.nci.org.au/thredds';

    $scope.layers.overlays.aWMS.name = prefix + layer.title;
    $scope.layers.overlays.aWMS.url = BASE_URL+'/wms/'+fn+'?';
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

  $scope.balanceColourScheme = function(entries) {
    if(entries.length>10) {
      var secondaryColumn = entries.splice(entries.length/2);
      for(var i=0;i<entries.length;i++){
        entries[i].push(secondaryColumn.shift()[0]);
      }
      if(secondaryColumn.length){
        secondaryColumn[0].unshift({});
        entries.push(secondaryColumn[0]);
      }
    }

    return entries;
  };

  $scope.updateColourScheme = function(applyLogTransform) {
    if(selection.selectedLayer.legend) {
      // +++ NASTY HACK TO GET DLCD CODES
      details[selection.selectedLayer.legend]().then(function(colourCodes){
        $scope.colourScheme = [];
        for(var key in colourCodes) {
          var e = colourCodes[key];
          $scope.colourScheme.push([
          {
            colour: 'rgb('+e.Red+','+e.Green+','+e.Blue+')',
            text:e.Class_Name
          }]);
        }
        $scope.colourScheme = $scope.balanceColourScheme($scope.colourScheme);
      });
    } else {
      colourschemes.coloursFor(selection.selectedLayer).then(function(data){
        var range = $scope.colourScaleRange;
        var decimalPlaces = Math.max(0,2-(+Math.log10(range[1]-range[0]).toFixed()));
        if(applyLogTransform) {
          range = range.map(Math.log);
        }
        var binSize = (range[1]-range[0])/data.length;

        var valToText = function(val,dp){
          dp = dp || decimalPlaces;
          dp = Math.min(dp,10);
          if(applyLogTransform){
            val = Math.exp(val);
          }
          return val.toFixed(dp);
        };

        var distinctText = function(val,lowerText){
          var valText;
          var dp = decimalPlaces;
          do{
            valText = valToText(val,dp);
            dp++;
          }while((+lowerText>=+valText)&&(dp<=10));

          return valText;
        };

        var lowerText = valToText(range[0]);
        $scope.colourScheme = data.slice().map(function(e,idx){
          var upperText = distinctText(range[0]+((idx+1)*binSize),lowerText);
          var label = lowerText + ' - ' + upperText;
          lowerText = upperText;
          return [{
            colour: e,
            text: label
          }];
        });
        $scope.colourScheme[data.length-1][0].text = '&ge;'+valToText(range[1]-binSize);
        $scope.colourScheme.reverse();
        $scope.colourScheme = $scope.balanceColourScheme($scope.colourScheme);
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
    $scope.mapControls.custom.push(createLeafeletCustomControl('topright','title'));
    $scope.mapControls.custom.push(createLeafeletCustomControl('bottomleft','links'));
    $scope.mapControls.custom.push(createLeafeletCustomControl('bottomleft','legend'));
    $scope.mapControls.custom.push(createLeafeletCustomControl('bottomright','details'));
    $scope.mapControls.custom.push(createLeafeletCustomControl('topleft','zoom'));
  };

  $scope.configureMapTools();

  $scope.setDefaultTheme = function(themesData){
    selection.selectTheme(themesData[0])
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

  $scope.showFeatureOverlays = function() {
    if($scope.layers.overlays.selectionLayer) {
      //$scope.layers.overlays.selectionLayer.style.weight = 3;
      $scope.geojson.style.fillColor='red';
      $scope.geojson.style.fillOpacity=0.65;
      $scope.geojson.style.color='black';
      //console.log($scope.layers.overlays.selectionLayer.layerOptions);
      //console.log($scope.layers.overlays.selectionLayer);
    }
  };

  $scope.dataModesAvailable = function() {
    return $scope.selection.selectedLayer &&
           $scope.selection.selectedLayer.normal &&
           $scope.selection.selectedLayer.delta;
  };

  $scope.mapModesAvailable = function() {
    return $scope.selection.selectedLayer &&
           selection.selectedLayer.summary &&
           !selection.selectedLayer.disablePolygons;
  };

  themes.themes().then(function(themeData){
    if(!$scope.selection.selectedLayer){
      $scope.setDefaultTheme(themeData); // Move to app startup
    }
  });

  $scope.selectPoint = function(latlng){
    selection.selectedPoint = latlng;
  }
});
