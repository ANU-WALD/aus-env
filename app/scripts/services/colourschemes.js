'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.colourschemes
 * @description
 * # colourschemes
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('colourschemes', function ($q,$http,selection,mapmodes) {
    var service = this;

    service.colourSchemes = {};

    service.colourSchemeNameForLayer = function(layer) {
      var sources = [layer];
      var rankMode = false;
      var mode = selection.dataModeConfig();
      if(mode==='rank'){
        mode='delta';

        if(selection.mapMode===mapmodes.region){
          rankMode = true;
        }
      }

      if(layer[mode]) {
        sources.unshift(layer[mode]);
      }

      for(var source in sources) {
        var palette = sources[source].palette;
        if(palette) {
          palette = palette[selection.mapMode.toLowerCase()] || palette;
          palette = palette[mode]||palette;
          if(rankMode){
            if(palette.endsWith('_inv')){
              return 'rdbu_7';
            }
            return 'rdbu_7_rev';
          }
          return palette;
        }
      }
      return 'rainbow';
    };

    service.coloursFor = function(layer) {
      var paletteName = service.colourSchemeNameForLayer(layer);
      if(!service.colourSchemes[paletteName]) {
        var result = $q.defer();

        $http.get('static/palettes/'+paletteName+'.pal',{params:{nocache:(new Date().toString())}}).success(function(data){
          var entries = data.split('\n').map(function(line){
            return line.replace(/\#.*/g,'').trim().replace(/ +/g,' ');
          }).filter(function(line){return line.length;});
          var colours = entries.map(function(entry){
            return 'rgb(' + entry.split(' ').join(',') + ')';
          });
          result.resolve(colours);
        });

        service.colourSchemes[paletteName] = result.promise;

      }
      return service.colourSchemes[paletteName];
    };

    service.arrayRange = function(theArray){
      var result = [Math.min.apply(null,theArray),Math.max.apply(null,theArray)];
      return result;
    };

    service.dataRange = function(dataMode,units,vals,columnName,forceDelta) {
      if(dataMode==='rank'){
        return [0,10];
      }

      if(units&&units.match(/composite score/)) {
        return dataMode==='delta'?[-5,5]:[0,10];
      }

      var colIdx = Math.max(vals.columnNames.indexOf(''+columnName),
                            vals.columnNames.indexOf(+columnName));
      var polygonValues = Object.keys(vals)
        .filter(function(key){return key.startsWith('PlaceIndex');})
        .map(function(key){
          return vals[key][colIdx];
        });
      polygonValues = polygonValues.filter(function(v){
        return isFinite(v);
      });
      var actualRange = service.arrayRange(polygonValues);

      if(forceDelta||((actualRange[0]<0)&&(actualRange[1]>0))) {
        var extent = Math.max(Math.abs(actualRange[0]),actualRange[1]);
        return [-extent,extent];
      }
      return actualRange;
    };

    service.annualDelta = function(values){
      var copy = JSON.parse(JSON.stringify(values));
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
      return copy;
    };
  });
