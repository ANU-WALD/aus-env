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
      var properties = ['palette'];
      if(layer[selection.dataMode]) {
        sources.unshift(layer[selection.dataMode]);
      }
      if(selection.mapMode===mapmodes.region) {
        properties.unshift('summary_palette');
      }

      for(var property in properties) {
        for(var source in sources) {
          var palette = sources[source][properties[property]];
          if(palette) {
            return palette;
          }
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
  });
