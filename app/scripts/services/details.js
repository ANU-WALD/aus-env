'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.details
 * @description
 * # details
 * Service in the ausEnvApp.
 */

//selection.regionType
//selection.selectedLayer
angular.module('ausEnvApp')
  .service('details', function ($q,$http) {
    var service = this;

    service.getBarChartData = function(the_summary, the_source){
      var result = $q.defer();
      var url = 'static/summary/'+the_summary+'.'+the_source+'.csv';
      var httpPromise = $http.get(url);

      var geojsonURL = 'static/selection_layers/'+the_source+'.json';
      var httpGeojsonURL = $http.get(geojsonURL);

      var jsonIdNameMap = new Map();

      httpGeojsonURL.then(function(json_resp){
        var related_json = json_resp.data;

        var json_features = related_json.features;

        json_features.forEach(function(feature) {
          //console.log(feature.properties);
          jsonIdNameMap.set(feature.properties.OBJECTID, feature.properties.RivRegName);
        });
        
      });

      httpPromise.then(function(resp){
        var text = resp.data;
        var lines = text.split('\n');
        var header = lines.shift();
        var columns = header.split(',');
        columns.shift();
        var data = {};
        lines.forEach(function(line){
          var cols = line.split(',');
          var polygonIdentifier = jsonIdNameMap.get(Number(cols.shift()));
          data[polygonIdentifier] = cols.map(function(val){return +val;}); //convert the numbers of type string into the actual numbers
          console.log(jsonIdNameMap);
        });

        data.columnNames = columns;
        console.log(data);
        result.resolve(data);
      });

      return result.promise;
    };

  });
