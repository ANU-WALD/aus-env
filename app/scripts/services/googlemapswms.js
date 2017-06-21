'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.googleMapsWMS
 * @description
 * # googleMapsWMS
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('googleMapsWMS', function ($window) {
    var service = this;
    service.TILE_SIZE=256;
    service.TILE_WIDTH=service.TILE_SIZE;
    service.TILE_HEIGHT=service.TILE_SIZE;

    var proj4 = $window.proj4;
    var webMercator = proj4(proj4.defs('EPSG:3857'));

    var pointToWebMercator = function(pt){
      return webMercator.forward([pt.lng(),pt.lat()]);
    };

    service.computeTileBounds = function(map,coord,zoom){
      var google = $window.google;
      var proj = map.getProjection();
      var zfactor = Math.pow(2, zoom);
      var xScale = service.TILE_WIDTH/zfactor;
      var yScale = service.TILE_HEIGHT/zfactor;

      var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * xScale, coord.y * yScale));
      var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * xScale, (coord.y + 1) * yScale));

      top = pointToWebMercator(top);
      bot = pointToWebMercator(bot);

      return [top[0],bot[1],bot[0],top[1]].join(',');
    };

    service.buildImageMap = function(getMap,getURL,getOptions,getOpacity){

      return {
        getTileUrl: function(coord,zoom){
          var theMap = getMap();
          if(!theMap){
            return null;
          }

          var bbox = service.computeTileBounds(theMap,coord,zoom);

          var url = getURL(zoom) + '&service=WMS&version=1.1.1&request=GetMap';
          url += "&BBOX=" + bbox;      // set bounding box
          url += "&FORMAT=image/png" ; //WMS format
          var layerParams = getOpacity?getOptions(zoom):{};
          for(var key in layerParams){
            url += '&'+key+'='+layerParams[key];
          }
          url += "&SRS=EPSG:3857";     //set Web Mercator
          return url;
        },
        tileSize:new google.maps.Size(service.TILE_SIZE,service.TILE_SIZE),
        isPng:true,
        opacity:getOpacity?getOpacity():1.0
      };
    };
  });
