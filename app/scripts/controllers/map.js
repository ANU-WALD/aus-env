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
                                   selection,themes,mapmodes,details,colourschemes) {

    $scope.selection = selection;
    $scope.mapmodes = mapmodes;

    $scope.mapControls = {
      custom:[]
    };

    angular.extend($scope, {
      defaults: {
        crs: L.CRS.EPSG4326,
        attributionControl: false,
        zoomControl:false,
        maxZoom: 12,
        minZoom: 4,
      }, //defaults

      mapCentre: {
        lat: selection.ozLatLngZm.lat,
        lng: selection.ozLatLngZm.lng,
        zoom: selection.ozLatLngZm.zoom
      }, //mapCentre
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
              zIndex:100
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

    });  //extend service (with leaflet stuff)



    $scope.$on('leafletDirectiveMap.load', function(/*event, args*/){
      selection.centreAustralia();
    });


    $scope.$on('leafletDirectiveMap.click', function(/*event, args*/){
      // +++ REMOVE?
      //console.log(args.leafletEvent.target);
      //selection.setCoordinates(args.leafletEvent.latlng);
      //selection.leafletData.getMap().then(function(map) { console.log(map); });
      //console.log(args);
    });

    $scope.$on('leafletDirectiveMap.click', function(event, args){
      if (args.leafletEvent.latlng.lat <= selection.ozLatLngMapBounds[0][0] &&
        args.leafletEvent.latlng.lat >= selection.ozLatLngMapBounds[1][0] &&
        args.leafletEvent.latlng.lng >= selection.ozLatLngMapBounds[0][1] &&
        args.leafletEvent.latlng.lng <= selection.ozLatLngMapBounds[1][1]) {
      }
      else {
        selection.clearSelection();
      }
      //window.alert(args.leafletEvent.latlng.lat >= selection.ozLatLngMapBounds[0][0]);
    });

    $scope.arrayRange = function(theArray){
      var result = [Math.min.apply(null,theArray),Math.max.apply(null,theArray)];
      return result;
    };

    $scope.dataRange = function(mappingVals) {
      var vals = mappingVals.values;
      var polygonRanges = Object.keys(vals)
        .filter(function(key){return key.startsWith('PlaceIndex');})
        .map(function(key){
          return $scope.arrayRange(vals[key]);
        });
      polygonRanges = polygonRanges.filter(function(p){
        return isFinite(p[0]) && isFinite(p[1]);
      });
      var actualRange = [
        Math.min.apply(null,polygonRanges.map(function(p){return p[0];})),
        Math.max.apply(null,polygonRanges.map(function(p){return p[1];}))
      ];
      if((actualRange[0]<0)&&(actualRange[1]>0)) {
        var extent = Math.max(Math.abs(actualRange[0]),actualRange[1]);
        return [-extent,extent];
      }
      return actualRange;
    };

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
        console.log('No values for key=' + key);
        return null;
      }

      var idx = $scope.polygonMapping.values.columnNames.indexOf(''+$scope.selection.year);
      var val = vals[idx];
//      var range = themes.colourRange($scope.selection.selectedLayer).split(',').map(function(v){
//        return +v;
//      });
      var range = $scope.polygonMapping.dataRange;
      var point = (range[1]-val)/(range[1]-range[0]);
      var pos = Math.round(point*($scope.polygonMapping.colours.length-1));
      var selectedColour = $scope.polygonMapping.colours[pos];

      //console.log(selectedColour,point,pos,key,vals,idx,val,range,point);

      return selectedColour;
    };

    $scope.geoJsonStyling = function(feature) {
      var fillOpacity = 1;
      var fillColor = $scope.polygonFillColour(feature) || 'unfilled';
      var weight=0, strokeOpacity=0;

      if(fillColor==='unfilled') {
        fillColor = 'black';
        fillOpacity = 0;
      } else {
        weight = 1;
        strokeOpacity = 1;
      }

      if(selection.selectedRegion && (feature===selection.selectedRegion.feature)){
        return {
          weight:6,
          strokeOpacity:0.5,
          color:'#FF6',
          fillOpacity:fillOpacity,
          fillColor:fillColor
        };
      }
      return {
        weight:weight,
        strokeOpacity:strokeOpacity,
        color:'#000',
        fillOpacity:fillOpacity,
        fillColor:fillColor
      };
    };

    $scope.selectFeature = function(feature) {
      selection.selectedRegion = selection.availableFeatures.filter(function(f){
        return f.name===feature.properties[selection.regionType.labelField];
      })[0];
    };

    $scope.$on('leafletDirectiveGeoJson.click',function(event,args){
      $scope.selectFeature(args.leafletEvent.target.feature);
    });

    $scope.polygonSelected = function(evt) {
      $scope.selectFeature(evt.target.feature);
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
        $scope.geoJsonLayer.setStyle($scope.geoJsonStyling);
      };

      if($scope.selection.mapMode===$scope.mapmodes.region) {

        $scope.fetchPolygonData().then(function(data){
          $scope.polygonMapping = {
            colours: data[1],
            values: data[0]
          };
          $scope.mapTitle = data[0].Title;
          $scope.mapDescription = data[0].Description;
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
          $scope.polygonMapping.dataRange = $scope.dataRange($scope.polygonMapping);
          $scope.colourScaleRange = $scope.polygonMapping.dataRange;
          $scope.updateColourScheme();
          if($scope.geoJsonLayer) {
            doUpdateStyles();
          }
        });
      } else {
        $scope.polygonColours = null;
      }

      if($scope.geoJsonLayer) {
          doUpdateStyles();
      }
    };

    ['selectedRegion','selectedLayer','regionType','mapMode','dataMode'].forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.updateStyling);
    });

  $scope.$watch('selection.themeObject',function(newVal){
    if(!newVal){
      return;
    }

    $scope.clearView();
  });

  $scope.$watch('selection.regionType',function(newVal){
    if(!newVal){
      $scope.selection.geojson = {};
      if($scope.layers.overlays.selectionLayer){
        delete $scope.layers.overlays.selectionLayer;
      }
      return;
    }

    $scope.geojson = {};
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
        layers:'wald:'+(newVal.sourceWMS||newVal.source),
        transparent:true,
        zIndex:50,
        showOnSelector: false
      }
    };
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

    if(selection.mapMode!==mapmodes.grid) {
      if($scope.layers.overlays.aWMS) {
        delete $scope.layers.overlays.aWMS;
      }
      return;
    }

    $scope.mapTitle = selection.selectedLayerTitle();
    $scope.mapDescription = selection.selectedLayer.description;

    $scope.colourScaleRange = selection.selectedLayer.colorscalerange;
    if(selection.selectedLayer[selection.dataMode]) {
      $scope.colourScaleRange = selection.selectedLayer[selection.dataMode].colorscalerange || $scope.colourScaleRange;
    }
    $scope.colourScaleRange = $scope.colourScaleRange.split(',').map(function(e){return +e;});

    var prefix = '';
    var keys = ['time','variable','url','colorscalerange',
                'belowmincolor','abovemaxcolor','palette','logscale'];

    var settings = {};
    keys.forEach(function(k){settings[k] = layer[k];});
    if(layer[selection.dataMode]) {
      if(selection.dataMode==='delta') {
        prefix = 'Change in ';
      }
      keys.forEach(function(k){
        settings[k] = layer[selection.dataMode][k] || settings[k];
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
    if(settings.belowmincolor){
      $scope.layers.overlays.aWMS.layerParams.belowmincolor = settings.belowmincolor;
    }

    if(settings.abovemaxcolor){
      $scope.layers.overlays.aWMS.layerParams.abovemaxcolor = settings.abovemaxcolor;
    }

    if(settings.palette) {
      $scope.layers.overlays.aWMS.layerParams.styles = 'boxfill/'+settings.palette;
    }

    if(settings.logscale) {
      $scope.layers.overlays.aWMS.layerParams.logscale = true;
    }

    $scope.layers.overlays.aWMS.layerParams.showOnSelector = false;
    $scope.layers.overlays.aWMS.doRefresh = true;
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
        entries.push(secondaryColumn);
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
        if(applyLogTransform) {
          range = range.map(Math.log);
        }
        var binSize = (range[1]-range[0])/data.length;

        var valToText = function(val){
          if(applyLogTransform){
            val = Math.exp(val);
          }
          return val.toFixed();
        }

        $scope.colourScheme = data.slice().map(function(e,idx){
          return [{
            colour: e,
            text: valToText(range[0]+(idx*binSize)) + ' - ' + valToText(range[0]+((idx+1)*binSize))
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
    $scope.mapControls.custom.push(createLeafeletCustomControl('bottomleft','title'));
    $scope.mapControls.custom.push(createLeafeletCustomControl('bottomleft','legend'));
    $scope.mapControls.custom.push(createLeafeletCustomControl('bottomright','details'));
    $scope.mapControls.custom.push(createLeafeletCustomControl('topleft','zoom'));
  };

  $scope.configureMapTools();

  $scope.setDefaultTheme = function(themesData){
    selection.theme = themesData[1].name;
    selection.themeObject = themesData[1];
    $scope.selectDefaultLayer(selection.themeObject);
  };

  $scope.selectDefaultLayer = function(themeObject){
    var defaultLayer = themeObject.layers.find(function(l){return l.default;});

    $scope.selection.selectedLayer = defaultLayer;
    $scope.selection.selectedLayerName = defaultLayer.title;
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
    layer.setStyle({
      weight: 2,
      color: 'black',
      fillColor: 'red',
      fillOpacity: 0.5,
    });
    layer.bringToFront();
  });

  $scope.dataModesAvailable = function() {
    return $scope.selection.selectedLayer &&
           $scope.selection.selectedLayer.normal &&
           $scope.selection.selectedLayer.delta;
  };

  themes.themes().then($scope.setDefaultTheme); // Move to app startup
});
