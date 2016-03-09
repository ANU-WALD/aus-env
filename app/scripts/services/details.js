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
    var jsonNameIdMap = new Map();
    var jsonIdNameMap = new Map();

    service.createPlaceMap = function(the_source) {
      var result = $q.defer();
      var geojsonURL = 'static/selection_layers/'+the_source+'.json';
      var httpGeojsonURL = $http.get(geojsonURL);

      httpGeojsonURL.then(function(json_resp){
        var related_json = json_resp.data;
        var json_features = related_json.features;
        json_features.forEach(function(feature) {
          jsonNameIdMap.set(feature.properties.RivRegName, feature.properties.OBJECTID);
        });
        result.resolve(jsonNameIdMap);
      });
      return result.promise;
    };

    service.getBarChartData = function(the_summary, the_source){
      var result = $q.defer();
      var url = 'static/summary/'+the_summary+'.'+the_source+'.csv';
      var httpPromise = $http.get(url);

      /*
      var geojsonURL = 'static/selection_layers/'+the_source+'.json';
      var httpGeojsonURL = $http.get(geojsonURL);

      httpGeojsonURL.then(function(json_resp){
        var related_json = json_resp.data;
        var json_features = related_json.features;
        json_features.forEach(function(feature) {
          //console.log(feature.properties);
          jsonIdNameMap.set(feature.properties.OBJECTID, feature.properties.RivRegName);
        });
      });
      */

      httpPromise.then(function(resp){
        var text = resp.data;
        var lines = text.split('\n');
        var header = lines.shift();
        var columns = header.split(',');
        columns.shift();
        var data = {};
        lines.forEach(function(line){
          var cols = line.split(',');
          var polygonIdentifier = "PlaceIndex" + cols.shift();
          data[polygonIdentifier] = cols.map(function(val){return +val;}); //convert the numbers of type string into the actual numbers
        });
        data.columnNames = columns;
        result.resolve(data);
      });
      return result.promise;
    };

    //<editor-fold desc="pete linegraph">
    service.makeSimpleLabels = function(length,prefix)
    {
      var pre = prefix || "";
      var labels = [];
      for(var i = 0; i<length; i++) {
        labels.push(pre + (i+1));
      }
      console.log(labels);
      return labels;
    };

    service.randomDataArray = function(length)
    {
      var data = [];
      for(var i = 0; i<length; i++) {
        data.push(Math.random());
      }
      console.log(data);
      return data;
    };
    //</editor-fold>

  });
