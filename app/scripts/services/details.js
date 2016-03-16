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
  .service('details', function ($q,$http,staticData) {
    var service = this;

    service.MAX_CACHE_LENGTH=20;
    service.cache = [];

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

    service.parseRegularCSV = function(text,idPrefix,asRecord){
      var idPrefix = (idPrefix===undefined)? 'PlaceIndex' : idPrefix;
      var data = {};
      var lines = text.split('\n');
      var header = lines.shift();
      var columns = header.split(',').map(Function.prototype.call,String.prototype.trim);;
      columns.shift();

      var parseValue = function(val){
        if(val==='-9999'){
          return null;
        }

        var num = +val;
        if(Number.isNaN(num)){
          return val.trim();
        }
        return num;
      };

      lines.forEach(function(line){
        var cols = line.trim().split(',');
        var polygonIdentifier = idPrefix + cols.shift();

        if(asRecord) {
          data[polygonIdentifier] = {};
          cols.forEach(function(val,idx){
            data[polygonIdentifier][columns[idx]] = parseValue(val);
          });
        } else {
          data[polygonIdentifier] = cols.map(parseValue); //convert the numbers of type string into the actual numbers
        }
      });
      data.columnNames = columns;
      return data;
    };

    service.parseCSVWithHeader = function(text,idPrefix,asRecord){
        var sections = text.split(/\n\-+\s*\n/);
        var data = null;
        if(sections.length>1){
          data = service.parseKeyValueHeader(sections.shift());
        } else {
          data = {};
        }

        angular.extend(data,service.parseRegularCSV(sections[0],idPrefix,asRecord));
        return data;
    };

    service.retrieveCSV = function(url){
      var existing = service.cache.filter(function(entry){
        return entry.url===url;
      });

      if(existing.length) {
        return existing[0].promise;
      }

      var result = $q.defer();
      var httpPromise = $http.get(url);

      httpPromise.then(function(resp){
        var data = service.parseCSVWithHeader(resp.data);
        result.resolve(data);
      });

      service.cache.push({
        url:url,
        promise:result.promise
      });

      if(service.cache.length>service.MAX_CACHE_LENGTH){
        service.cache.shift();
      }

      return result.promise;
    };

    service.getBarChartData = function(the_summary, the_source){
      var url = 'static/summary/'+the_summary+'.'+the_source+'.csv';
      return service.retrieveCSV(url);
    };

    service.getPieChartData = function(layer_variable,polygon_layer,year){
      var url = 'static/summary/pie/'+layer_variable+'.'+polygon_layer+'_Landcover.'+year+'.csv';
      var mainData = service.retrieveCSV(url);
      var landCover = service.landCoverCodes();
      var result = $q.defer();

      $q.all([mainData,landCover]).then(function(results){
        var data = results[0];
        var landCoverCodes = results[1];
        data.columnPresentation = landCoverCodes;
        result.resolve(data);
      });
      return result.promise;
    };

    service.landCoverCodes = staticData.deferredGet(service,'static/config/DLCD_codes.csv','_landcoverText',function(text){
      return service.parseRegularCSV(text,'',true);
    });

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
