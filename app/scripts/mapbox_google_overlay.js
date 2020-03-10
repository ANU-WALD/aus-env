'use strict';

/* global google document */
var Evented = mapboxgl.Evented;

var TILE_SIZE = 256;

// This is designed to be used with Object.freeze (because it's slow in Vue otherwise)

function MapboxGoogleOverlay(options) {
  this.mapboxRenderer = new mapboxgl.BasicRenderer(options);
  var _self = this;
  this.styleLoadedPromise = new Promise(function(res){
    return _self.mapboxRenderer.on('data', function(data){
      return (data.dataType === "style") && res();
    });
  });
  this.tileSize = new google.maps.Size(TILE_SIZE, TILE_SIZE);
  this.minZoom = options.minZoom || 10;
  this.maxZoom = options.maxZoom || 21;
  this.availableZooms = options.availableZooms;
  this._unusedTilesPool = [];
  this._visibleTiles = new Map(); // domEl => {canv, ctx, coord, zoom, renderRef}
  this._dummyTile = document.createElement('div');

  // some stuff for events, which the consumer may want
  this.evented = new Evented();
  this.on = this.evented.on.bind(this.evented);
  this.off = this.evented.on.bind(this.evented);
  this.mapboxRenderer.setEventedParent(this.evented, {});
  this._renderInfo = {
    tilesPending: 0,
    errors: 0,
    startTime: null
  };
  this._thawed = { // to allow for changing despite Object.freeze, some can be set externally with setMouseOptions method
    map: null,
    _mousemove: null,
    _click: null,
    mouseBehaviour: !!options.mouseBehaviour || "features", // can be "everywhere", "features", or "none".
    clickSources: options.clickSources || [], // when mouseBehavior is "features", this is the list of source names to use when querying in click events
    mousemoveSources: options.mousemoveSources || [] // same as above, but for mousemove
  };
}

var MAX_TILE_POOL_SIZE = 30;

MapboxGoogleOverlay.prototype._createTile = function(){
  var canv = document.createElement('canvas');
  canv.width = TILE_SIZE;
  canv.height = TILE_SIZE;
  canv.style.imageRendering = 'pixelated';
  return canv;
};


MapboxGoogleOverlay.prototype.queryRenderedFeatures = function(opts){
  // opts = {lat, lng, zoom}
  var availableZooms = this.availableZooms[opts.source];
  var zoom = [availableZooms[0]];
  if(availableZooms.indexOf(opts.zoom)>=0){
    zoom = [opts.zoom];
  } else if(opts.zoom>availableZooms[availableZooms.length-1]){
    zoom = [availableZooms[availableZooms.length-1]];
  }
  return this.mapboxRenderer.queryRenderedFeatures({
    lat: opts.lat,
    lng: opts.lng,
    tileZ: zoom,
    source: opts.source,
    renderedZoom: opts.zoom
  });
};

MapboxGoogleOverlay.prototype.setMouseOptions = function(opts){
  // see constructor for details
  Object.assign(this._thawed, opts);
};



MapboxGoogleOverlay.prototype._getTilesSpec = function(coord, zoom, source){
  var availableZooms = this.availableZooms[source];
  var maxZoom = availableZooms[availableZooms.length-1];
  var minZoom = availableZooms[0];

  if(availableZooms.indexOf(zoom)>=0){
    // 3x3 grid of source tiles, where the region of interest is that corresponding to the central source tile
    var ret = [];
    for(var x=-1;x<=1;x++) for(var y=-1; y<=1; y++){
      ret.push({
        source: source,
        z: zoom, // [zoom],
        x: coord.x + x,
        y: coord.y + y,
        left: 0 + x*TILE_SIZE,
        top: 0 + y*TILE_SIZE,
        size: TILE_SIZE
      });
    }
    return ret;

  } else if (zoom > maxZoom){
    // this may be either a single source tile, if we are interested in an interior region,
    // or as much as 4 source tiles, if we have to get the corner of the tile.
    var shift = (zoom-maxZoom);
    var mask = (1<<shift)-1;
    var size = TILE_SIZE * (1 << shift);
    var ret = [];
    for(var x=-1;x<=1;x++) for(var y=-1;y<=1;y++){
      if( (x===-1 && (coord.x & mask)!==0)    ||
          (x===+1 && (coord.x & mask)!==mask) ||
          (y===-1 && (coord.y & mask)!==0)    ||
          (y===+1 && (coord.y & mask)!==mask)  ) {
        continue;
      }
      ret.push({
        source: source,
        z: maxZoom, // [maxZoom],
        x: (coord.x >> shift) + x,
        y: (coord.y >> shift) + y,
        left: -(coord.x & mask)*TILE_SIZE + x*size,
        top: -(coord.y & mask)*TILE_SIZE + y*size,
        size: size
      });
    }
    return ret;
  } else {
    // grid of (nParts+2)x(nPartsx2) source tiles, where the region of interest is that corresponding to the central nParts x nParts tiles
    var shift = (minZoom-zoom);
    var nParts = (1<<shift);
    var ret = [];
    var size = TILE_SIZE / (1 << shift);
    for(var xx=-1; xx<=nParts; xx++) for(var yy=-1; yy<=nParts; yy++){
      ret.push({
        source: source,
        z: minZoom, // [minZoom],
        x: (coord.x << shift) + xx,
        y: (coord.y << shift) + yy,
        left: xx * size,
        top: yy * size,
        size: size
      });
    }
    return ret;
  }
};


MapboxGoogleOverlay.prototype._renderTile = function(el){
  !this._renderInfo.startTime && (this._renderInfo.startTime = Date.now());
  this._renderInfo.tilesPending++;

  var state = this._visibleTiles.get(el);
  this.mapboxRenderer.filterForZoom(state.zoom);

  var _self = this;
  var tilesSpec = this.mapboxRenderer
    .getVisibleSources(state.zoom)
    .reduce(function(a,s){ return a.concat(_self._getTilesSpec(state.coord, state.zoom, s)); }, []);
  state.ctx.globalCompositeOperation = 'copy';
  state.renderRef = this.mapboxRenderer.renderTiles(
    state.ctx,
    {srcLeft: 0, srcTop: 0, width: TILE_SIZE, height: TILE_SIZE, destLeft: 0, destTop: 0},
    tilesSpec,
    function(err) {
      _self._renderInfo.errors += err && err !== "canceled" ? 1 : 0;
      _self._renderInfo.tilesPending--;
      _self.evented.fire('finishedRender', this._renderInfo);
      if(_self._renderInfo.tilesPending === 0){
        _self._renderInfo.errors = 0;
        _self._renderInfo.startTime = null;
      }
    }
  );
};

MapboxGoogleOverlay.prototype.getTile = function(coord, zoom) {
  if(zoom < this.minZoom || zoom > this.maxZoom){
    return this._dummyTile; // for some reason the zoom limits are ignored so we have to do this
  }
  var canv = this._unusedTilesPool.pop() || this._createTile();
  canv.width = TILE_SIZE; // clear the canvas

  this._visibleTiles.set(canv, {
    canv: canv,
    ctx: canv.getContext('2d'),
    coord: coord,
    zoom: zoom,
    renderRef: null
  });
  this._renderTile(canv);
  return canv;
};

MapboxGoogleOverlay.prototype.reRenderAll = function(){
  var _self = this;
  this._visibleTiles.forEach(function(state,el) {
    _self.mapboxRenderer.releaseRender(state.renderRef);
    _self._renderTile(el);
  });
};

/* the next four functions wrap similarly named methods in mapboxRenderer
  and like those methods, they can either be executed immediately or,
  by default, they will return a function which can be used to trigger
  execution at a later point. This enables debouncing of changes. */
MapboxGoogleOverlay.prototype.setPaintProperty = function(layer, prop, val, exec) {
  if(exec===undefined){
    exec=true;
  }
  var result = this.mapboxRenderer.setPaintProperty(layer, prop, val, exec);
  var _self = this;
  return exec ? result.then(function(isLatest){ return isLatest && _self.reRenderAll();})
              : function(){ return result().then(function(isLatest){ return isLatest && _self.reRenderAll();});};
};

MapboxGoogleOverlay.prototype.setFilter = function(layer, filter, exec) {
  if(exec===undefined){
    exec=true;
  }
  var result = this.mapboxRenderer.setFilter(layer, filter, exec);
  var _self = this;
  return exec ? result.then(function(isLatest){ return isLatest && _self.reRenderAll();})
              : function(){ return result().then(function(isLatest){return isLatest && _self.reRenderAll();});};
};

MapboxGoogleOverlay.prototype.setLayers = function(visibleLayers, exec) {
  if(exec===undefined){
    exec=true;
  }
  var result = this.mapboxRenderer.setLayers(visibleLayers, exec);
  var _self = this;
  return exec ? result.then(function(isLatest){ return isLatest && _self.reRenderAll();})
              : function(){ return result().then(function(isLatest){return isLatest && _self.reRenderAll();});};
};

MapboxGoogleOverlay.prototype.setLayerVisibility = function(layer, isVisible, exec) {
  if(exec===undefined){
    exec=true;
  }
  var result = this.mapboxRenderer.setLayerVisibility(layer, isVisible, exec);
  var _self = this;
  return exec ? result.then(function(isLatest){ return isLatest && _self.reRenderAll();})
              : function() { return result().then(function(isLatest){ return isLatest && _self.reRenderAll();});};
};

// ==================

MapboxGoogleOverlay.prototype.getLayerOriginalFilter = function(layer){
  return this.mapboxRenderer.getLayerOriginalFilter(layer);
};

MapboxGoogleOverlay.prototype.getLayerOriginalPaint = function(layer){
  return this.mapboxRenderer.getLayerOriginalPaint(layer);
};

MapboxGoogleOverlay.prototype.releaseTile = function(el){
  if(el === this._dummyTile){
    return;
  }
  var state = this._visibleTiles.get(el);
  this.mapboxRenderer.releaseRender(state.renderRef);
  this._visibleTiles.delete(el);
  if (this._unusedTilesPool.length < MAX_TILE_POOL_SIZE) {
    this._unusedTilesPool.push(el);
  }
};

MapboxGoogleOverlay.prototype._mouseEvent = function(kind, mouseEvent){
  if(!this._thawed._map){
    return;
  }

  var overFeature = false;

  if(this._thawed.mouseBehaviour === "none"){
    return; // don't even try controlling the cursor
  } else if(this._thawed.mouseBehaviour === "everywhere"){
    this.evented.fire(kind, {mouseEvent:mouseEvent, features: {}, source: null});
    overFeature = true;
  } else {

    var _self = this;
    (kind === 'click' ? this._thawed.clickSources : this._thawed.mousemoveSources).forEach(function(source) {
      var features = _self.queryRenderedFeatures({
        lat: mouseEvent.latLng.lat(),
        lng: mouseEvent.latLng.lng(),
        zoom: _self._thawed._map.getZoom(),
        source: source
      });
      if(Object.keys(features).length) {
        // this.evented.fire(kind, {source, features, mouseEvent});
        overFeature = true;
      }
      _self.evented.fire(kind, {source:source, features:features, mouseEvent:mouseEvent});
    });
  }

  if(kind === "mousemove"){
    this._thawed._map.setOptions({draggableCursor: overFeature ? 'pointer' :  ''});
  }

};

MapboxGoogleOverlay.prototype.addToMap = function(map){
  if(map.overlayMapTypes.indexOf(this) !== -1){
    return;
  }
  // map.overlayMapTypes.push(this);
  this._thawed._map = map;
  this._thawed._mousemove = google.maps.event.addListener(map, 'mousemove', this._mouseEvent.bind(this, "mousemove"));
  this._thawed._click = google.maps.event.addListener(map, 'click', this._mouseEvent.bind(this, "click"));
};

MapboxGoogleOverlay.prototype.removeFromMap = function(map){
  console.assert(map && map === this._thawed._map);
  // var idx = map.overlayMapTypes.indexOf(this);
  // if(idx !== -1){
    // map.overlayMapTypes.removeAt(idx);
    this._thawed._mousemove.remove();
    this._thawed._click.remove();
    // google.maps.event.removeListener(this._thawed._mousemove);
    // google.maps.event.removeListener(this._thawed._click);
  // }
  this._thawed._map = null;
  // this._visibleTiles.forEach((v,k) => this.releaseTile(k));
};


MapboxGoogleOverlay.prototype.getLayersVisible = function(zoom) {
  return this.mapboxRenderer.getLayersVisible(zoom);
};
