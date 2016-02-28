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

    _initialise();
    _initialiseLeafLetData();

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

    function _initialise() {
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
    }

    function _initialiseLeafLetData() {
      angular.extend(service, {
        defaults: {
          scrollWheelZoom: false,
          crs: L.CRS.EPSG4326
        }, //defaults

        mapCentre: {
          lat: service.ozLatLngZm.lat,
          lng: service.ozLatLngZm.lng,
          zoom: service.ozLatLngZm.zoom
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
              url: service.WMS_SERVER + '/public/wms?',
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
              url: service.WMS_SERVER + '/public/wms?',
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
    } //initialiseLeafletData

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
