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
//    var jsonNameIdMap = new Map();
//    var jsonIdNameMap = new Map();

    service.parseKeyValueHeader = function(text) {
      var lines = text.split?text.split('\n'):text;
      var result = {};

      lines.forEach(function(line){
        var components = line.split(',');
        var key = components.shift();
        var value = components.join(',');
        result[key] = value;
      });

      return result;
    };

    service.parseRegularCSV = function(text){
      var data = {}
      var lines = text.split('\n');
      var header = lines.shift();
      var columns = header.split(',');
      columns.shift();

      lines.forEach(function(line){
        var cols = line.split(',');
        var polygonIdentifier = "PlaceIndex" + cols.shift();
        data[polygonIdentifier] = cols.map(function(val){return (val==='-9999')?null:+val;}); //convert the numbers of type string into the actual numbers
      });
      data.columnNames = columns;
      return data;
    };

    service.parseCSVWithHeader = function(text){
        var sections = text.split(/\n\-+ *\n/);
        var data = null;
        if(sections.length>1){
          data = service.parseKeyValueHeader(sections.shift());
        } else {
          data = {};
        }

        angular.extend(data,service.parseRegularCSV(sections[0]));
        return data;
    };

    service.retrieveCSV = function(url){
      var result = $q.defer();
      var httpPromise = $http.get(url);

      httpPromise.then(function(resp){
        var data = parseCSVWithHeader(resp.data);
        result.resolve(data);
      });
      return result.promise;
    };

    service.getBarChartData = function(the_summary, the_source){
      var url = 'static/summary/'+the_summary+'.'+the_source+'.csv';
      return service.retrieveCSV(url);
    };

    service.getPieChartData = function(layer_variable,polygon_layer,year){
      var url = 'static/summary/'+layer_variable+'.'+polygon_layer+'.'+year+'.csv';
      return service.retrieveCSV(url);
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
