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
  .service('selection', function (leafletData) {
    var service = this;

    service.year = 2009;
    service.theme = 'Tree Cover';
    service.themeObject = null;
    service.mapMode = 'Grid';
    service.regionType = null;
    service.regionName = null;
    service.selectedLayerName = null;
    service.selectedLayer = null;
    service.selectedDetailsView = 'bar';
    service.selectedRegion = null;
    service.availableFeatures = [];
    service.WMS_SERVER = 'http://hydrograph.flowmatters.com.au';
    service.ozLatLngZm = { lat: -23.07, lng: 135.08, zoom: 5 };

    service.leafletData = leafletData;

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
    service.zoomToFeature = function() {
      if ((service.mapMode === 'Polygon') || (service.selectedRegion === undefined)) {
        var geojson = L.geoJson(service.selectedRegion.feature);
        leafletData.getMap().then(function (map) {
          map.fitBounds(geojson.getBounds(), {maxZoom: 13});
        });
      } else {
        service.centreAustralia();
      }
    }; //zoomToFeature

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
        var oz = service.ozLatLngZm;
        map.setView([oz.lat, oz.lng], oz.zoom);
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
      service.mapMode = "Grid";
    };

    service.isMapModeGrid = function() {
      return (service.mapMode === "Grid");
    };

    service.setOpacity = function(opacity) {
      if(service.layers.overlays.selectionLayer) {
        var opac = service.layers.overlays.selectionLayer.layerOptions.opacity || 1;
        //console.log(opac);
        opac += opacity;
        if (opac < 0) opac = 0;
        if (opac > 1) opac = 1;
        service.layers.overlays.selectionLayer.layerOptions.opacity = opac;
        service.layers.overlays.selectionLayer.doRefresh = true;
        //console.log(service.layers.overlays.selectionLayer);
      }
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
