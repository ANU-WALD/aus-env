'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.selection
 * @description
 * # selection
 * Service in the ausEnvApp.
 *
 * Responsible for managing selection choices and the map.
 */
angular.module('ausEnvApp')
  .service('selection', function ($q,uiGmapGoogleMapApi,uiGmapIsReady,mapmodes,configuration,spatialFoci) {
    var service = this;
    service.mapmodes = mapmodes;
    var MAX_ZOOM_LOCATE = 13;
    service.bounds = {
      year:{
        min:2004,
        max:2015
      }
      // +++TODO Limit pan and zoom
    };

    service.year = service.bounds.year.max;
    service.theme = null;
    service.themeObject = null;
    service.mapMode = mapmodes.grid;
//    service.highlight = {
//      region: true,
//      point: false
//    };
    service.imageMode = 'opaque';
    service.dataMode = 'normal'; // vs delta
    service.mapType='Roadmap';
    service.regionType = null;
    service.regionName = null;
    service.selectedLayer = null;
    service.detailsVisible = true;
    service.selectedDetailsView = 0;

    service.selectionMode='region';
    service.selectedRegion = null;
    service.availableFeatures = [];
    service.selectedPoint = null;
//    service.WMS_SERVER = 'http://localhost:8881';
    service.WMS_SERVER = 'http://hydrograph.flowmatters.com.au';
    service.ozLatLngZm = {
      center:{
        latitude: -23.07,
        longitude: 135.08
      },
      zoom: 5
    };

    service.ozLatLngMapBounds = {
      east:150,
      north:-10,
      south:-45,
      west:110
    };
    service.mapCentre = {
      center:{
        latitude: service.ozLatLngZm.center.latitude,
        longitude: service.ozLatLngZm.center.longitude
      },
      zoom: service.ozLatLngZm.zoom
    };

    service.navbarCollapsed=true;
    service.showMapSearchBar = false;
    service.loadingPolygons = false;

    var deferredSetter=function(target,prop,promise,fn){
      var capitalised = prop[0].toUpperCase()+prop.slice(1);
      target['get'+capitalised] = function(){
        var result = $q.defer();
        target['_getting'+capitalised].then(function(){
          result.resolve(target[prop]);
        });
        return result.promise;
      };

      var d = $q.defer();

      target['_getting'+capitalised]=d.promise;
      promise.then(function(result){
        fn(result);
        d.resolve();
      });
    };

    deferredSetter(service,'regionType',spatialFoci.regionTypes(),function(regions){
      service.regionType = regions[0];
      service.initialisePolygons(regions[0]);
    });

    service.moveYear = function(dir){
      service.year += dir;
      service.checkYear();
    };

    service.setYear = function(yr){
      service.year = +yr;
      if(isNaN(service.year)){
        service.year=service.bounds.year.max;
      }
      service.checkYear();
    };

    service.checkYear = function(){
      service.year = Math.max(service.bounds.year.min,service.year);
      service.year = Math.min(service.bounds.year.max,service.year);
    };

    service.selectThemeByName = function(themeName){
      deferredSetter(service,'selectedLayer',configuration.themes(),function(allThemes){
        var found = false;
        allThemes.forEach(function(theme){
          if(found){
            return;
          }

          theme.layers.forEach(function(layer){
            if(found){
              return;
            }

            if(layer.title===themeName){
              service.selectTheme(theme);
              service.selectedLayer = layer;
              found=true;
            }
          });
        });
      });
    };

    service.selectThemeByName('Tree Cover');

    service.selectTheme = function(theme){
      service.theme = theme.name;
      service.themeObject = theme;
      service.selectDefaultLayer(service.themeObject);
    };

    service.selectDefaultLayer = function(themeObject){
      var defaultLayer = themeObject.layers.filter(function(l){return l.default;})[0];

      service.selectedLayer = defaultLayer;
    };

    /*
     * @ngdoc function
     * @name makeLayer
     * @module ausEnvApp
     * @kind function
     *
     * @description
     * Makes a layer
     *
     * @returns a layer object
     *
     */
    service.makeLayer = _makeLayer;

    service.doWithMap = function(fn){
      return uiGmapGoogleMapApi.then(function () {
        uiGmapIsReady.promise(1).then(function(instances){
//            var geojson = L.geoJson(service.selectedRegion.feature);
          var map = instances[0].map;
          fn(map);
        });
      });
    };
    /*
     * @ngdoc function
     * @module ausEnvApp
     * @kind function
     *
     * @description
     * Zooms to current selected region or Australia if no
     *
     */
    service.zoomToFeature = function(forceAustralia) {
      // +++ CHECK. No longer enfore mapMode = Polygon when displaying polygon layers
      if(forceAustralia || (service.selectedRegion === undefined)) {
        service.centreAustralia();
      } else {
        service.selectionMode='region';

        service.doWithMap(function(map){
          var bounds  = new  google.maps.LatLngBounds();
          var key = service.selectedRegion.feature.properties[service.regionType.keyField];
          map.data.forEach(function(feature){
            var fKey = feature.getProperty(service.regionType.keyField);
            if(fKey===key){
              feature.getGeometry().forEachLatLng(function(ll){
                bounds.extend(ll);
              });
            }
          });
          map.fitBounds(bounds);
          map.setZoom(Math.min(map.getZoom(),MAX_ZOOM_LOCATE));
        });
      }
      service.navbarCollapsed = true; // USED?
    }; //zoomToFeature

    service.zoomToSelectedPoint = function(){
      if(!service.selectedPoint){
        return;
      }

      var bounds  = new  google.maps.LatLngBounds();
      var pt = new google.maps.LatLng(service.selectedPoint.lat(),service.selectedPoint.lng());
      service.doWithMap(function(map){
        bounds.extend(pt);
        map.fitBounds(bounds);
        map.setZoom(Math.min(map.getZoom(),MAX_ZOOM_LOCATE));
      });
    };

    service.clearRegionSelection = function() {
      service.selectedRegion = null;
      //service.selectedRegionName(); // +++TODO Huh?
    };

    service.selectedRegionName = function() {
      if(!service.selectedRegion || !service.selectedRegion.feature) {
        return (service.regionType&&service.regionType.globalLabel) || 'National';
      }

      return service.selectedRegion.feature.properties[service.regionType.labelField];
    };

    service.haveRegion = function() {
      return service.selectedRegion && (service.selectedRegion!=="");
    };

    service.initialisePolygons = function(newOption) {
      var result = $q.defer();
      service.availableFeatures = [];
      service.selectedRegion = null;

      if(!spatialFoci.show(newOption)){
        return;
      }

      service.loadingPolygons = true;
      service.loadingPolygonsPromise = result.promise;

      newOption.jsonData().then(function(data){
        if(service.regionType!==newOption){
          result.resolve(true);
          return;
        }

        service.availableFeatures = data.features.map(function(f){
          return {
            name:f.properties[newOption.labelField],
            feature:f
          };
        });
        service.availableFeatures.sort(function(a,b){return a.name.localeCompare(b.name);});
        service.loadingPolygons = false;
        result.resolve(true);
      });
    };

    /*
     * @ngdoc function
     * @name centreAustralia
     * @module ausEnvApp
     * @kind function
     *
     * @description
     * Centres the map to Australia.
     *
     * @todo
     * Need to consider leaflet controller container size properly
     *
     */
    service.centreAustralia = function() {
      service.doWithMap(function(map){
        map.fitBounds(service.ozLatLngMapBounds);
      });
    };

    service.clearFeatureOverlays = function() {
      if(service.layers.overlays.selectionLayer) {
        delete service.layers.overlays.selectionLayer;
      }
      //service.layers.clearLayers();
      //leafletData.getMap().then(function(map) { console.log("trying"); console.log(map); map.clearLayers(); } );
    };

    service.setMapModeGrid = function() {
      service.mapMode = mapmodes.grid;
    };

    service.mapModesAvailable = function() {
      return service.selectedLayer &&
             service.selectedLayer.summary &&
             !service.selectedLayer.disablePolygons;
    };

    service.dataModesAvailable = function() {
      return service.selectedLayer &&
             service.selectedLayer.normal &&
             service.selectedLayer.delta;
    };

    service.setRegionTypeByName = function(name){
      var result = $q.defer();

      deferredSetter(service,'regionType',spatialFoci.regionTypes(),function(types){
        var match = types.filter(function(f){
          return f.name===name;
        })[0];
        service.regionType = match || service.regionType;

        service.initialisePolygons(service.regionType);
        result.resolve(true);
      });
      return result.promise;
    };

    service.selectRegionByName = function(name,type){
      service.setRegionTypeByName(type).then(function(){
        service.loadingPolygonsPromise.then(function(){
          service.selectedRegion = service.availableFeatures.filter(function(f){
            return f.name===name;
          })[0];
        });
      });
    };

    service.isMapModeGrid = function() {
      return (service.mapMode === mapmodes.grid);
    };

    service.setOpacity = function(opacity) {
      // +++ redundant???
      if(service.layers.overlays.selectionLayer) {
        var opac = service.layers.overlays.selectionLayer.layerOptions.opacity || 1;
        opac += opacity;
        if (opac < 0){ opac = 0; }
        if (opac > 1){ opac = 1; }
        service.layers.overlays.selectionLayer.layerOptions.opacity = opac;
        service.layers.overlays.selectionLayer.doRefresh = true;
      }
    };

    service.selectedLayerTitle = function(text) {
      if(!service.selectedLayer) {
        return '';
      }

      if(service.selectedLayer.delta && (service.dataMode==='delta')){
        return 'Change in ' + (text||service.selectedLayer.title);
      }
      return text||service.selectedLayer.title;
    };

    function _makeLayer() {
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
          width:256,
          height:256,
          minZoom: 1,
          maxZoom: 15,
//              width:512,
//              height:512,
          numcolorbands:50,
          colorscalerange:'0,1',
          belowmincolor:'transparent',
          abovemaxcolor:'extend'
        }
      }; //return
    } //service.makeLayer

    service.useSelectedPoint = function(){
      return service.selectedPoint&&(service.selectionMode==='point');
    };
  });
