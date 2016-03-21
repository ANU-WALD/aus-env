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
  .service('details', function ($q,$http,$window,staticData,csv) {
    var service = this;

    service.dap = $window.dap;
    service.MAX_CACHE_LENGTH=20;
    service.cache = [];

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
        var data = csv.parseCSVWithHeader(resp.data);
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
      var url = 'static/summary/annual_time_series/'+the_summary+'.'+the_source+'.TimeSeries.sum.csv';
      return service.retrieveCSV(url);
    };

    service.getPieChartData = function(layer_variable,polygon_layer,year){
      var url = 'static/summary/pie/'+layer_variable+'.'+polygon_layer+'.DLCD.'+year+'.sum.csv';
      var mainData = service.retrieveCSV(url);
      var landCover = service.landCoverCodes();
      var result = $q.defer();

      $q.all([mainData,landCover]).then(function(results){
        var data = results[0];
        data.columnNames = data.columnNames.map(function(c){return +c;});
        var landCoverCodes = results[1];
        data.columnPresentation = landCoverCodes;
        result.resolve(data);
      });
      return result.promise;
    };

    service.landCoverCodes = staticData.deferredGet(service,'static/config/DLCD_codes.csv','_landcoverText',function(text){
      return csv.parseRegularCSV(text,'',true);
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
