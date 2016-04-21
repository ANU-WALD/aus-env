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
  .service('selection', function (leafletData,mapmodes) {
    var service = this;
    service.mapmodes = mapmodes;

    service.year = 2015;
    service.theme = 'Tree Cover';
    service.themeObject = null;
    service.mapMode = mapmodes.grid;
    service.dataMode = 'normal'; // vs delta
    service.regionType = null;
    service.regionName = null;
    service.selectedLayerName = null; // USED????
    service.selectedLayer = null;
    service.detailsVisible = true;
    service.selectedDetailsView = 'bar';
    service.selectedRegion = null;
    service.availableFeatures = [];
    service.WMS_SERVER = 'http://hydrograph.flowmatters.com.au';
    service.ozLatLngZm = { lat: -23.07, lng: 135.08, zoom: 5 };
    service.ozLatLngMapBounds = [[-10,110],[-45,150]];
    service.navbarCollapsed=true;
    service.leafletData = leafletData;
    service.showMapSearchBar = false;
    service.loadingPolygons = false;
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

    /*
     * @ngdoc function
     * @name setCoordinates
     * @module ausEnvApp
     * @kind function
     *
     * @description
     * Sets the current coordinates.  Does not move or zoom the map.
     *
     * @params {array} An array of two numbers, lat and long.
     * @returns void
     *
     */
    service.setCoordinates = function(latlngArray) {
      service.coordinates = latlngArray;
    }; //_setCoordinates;

    /*
     * @ngdoc function
     * @name centreAustralia
     * @module ausEnvApp
     * @kind function
     *
     * @description
     * Zooms to current selected region or Australia if no
     *
     */
    service.zoomToFeature = function(forceAustralia) {
      // +++ CHECK. No longer enfore mapMode = Polygon when displaying polygon layers
      if (!forceAustralia && (service.selectedRegion !== undefined)) {
        var geojson = L.geoJson(service.selectedRegion.feature);
        leafletData.getMap().then(function (map) {
          map.fitBounds(geojson.getBounds(), {maxZoom: 13});
        });
      } else {
        service.centreAustralia();
      }
      service.navbarCollapsed = true;
    }; //zoomToFeature

    service.clearSelection = function() {
      service.selectedRegion = null;
      service.selectedRegionName();
    };

    service.selectedRegionName = function() {
      if(!service.selectedRegion || !service.selectedRegion.feature) {
        return 'National';
      }

      return service.selectedRegion.feature.properties[service.regionType.labelField];
    };

    service.haveRegion = function() {
      return service.selectedRegion && (service.selectedRegion!=="");
    };

    service.initialisePolygons = function(newOption) {
      service.loadingPolygons = true;
      newOption.jsonData().then(function(data){
        service.availableFeatures = data.features.map(function(f){
          return {
            name:f.properties[newOption.labelField],
            feature:f
          };
        });
        service.availableFeatures.sort(function(a,b){return a.name.localeCompare(b.name);});
        service.selectedRegion = null;
        service.loadingPolygons = false;
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
      leafletData.getMap().then(function (map) {
        //var oz = service.ozLatLngZm;
        map.fitBounds(service.ozLatLngMapBounds);
        //map.setView([oz.lat, oz.lng], oz.zoom);
      });
    };

    service.clearFeatureOverlays = function() {
      //console.log("here");
      //console.log(service.geojson);
      //console.log(service.layers.overlays);
      if(service.layers.overlays.selectionLayer) {
        delete service.layers.overlays.selectionLayer;
      }
      //service.layers.clearLayers();
      //leafletData.getMap().then(function(map) { console.log("trying"); console.log(map); map.clearLayers(); } );
    };

    service.setMapModeGrid = function() {
      service.mapMode = mapmodes.grid;
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
          tileSize:256,
          minZoom: 1,
          maxZoom: 15,
//              width:512,
//              height:512,
          numcolorbands:50,
          colorscalerange:'0,1',
          belowmincolor:'transparent',abovemaxcolor:'extend'
        }
      }; //return
    } //service.makeLayer

  });
