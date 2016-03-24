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
  .service('details', function ($q,$http,$window,staticData,selection,csv) {
    var service = this;

    var STATIC_CSV_SOURCE='/aucsv/accounts/';
    var ANNUAL_TIME_SERIES=STATIC_CSV_SOURCE;
    var PIE_CHART_DATA=STATIC_CSV_SOURCE;
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

    service.summaryName = function() {
      var summaryName = null;
      if(selection.selectedLayer[selection.dataMode]){
        summaryName = selection.selectedLayer[selection.dataMode].summary;
      }
      summaryName = summaryName || selection.selectedLayer.summary;
      return summaryName;
    };

    service.polygonSource = function() {
      if(selection.haveRegion()) {
        return selection.regionType.summaryName || selection.regionType.source;
      } else {
        return "SA3_2011_AUST";
      }
    };

    service.getBarChartData = function(){
      var url = ANNUAL_TIME_SERIES+service.summaryName()+'.'+service.polygonSource()+'.TimeSeries.sum.csv';
      return service.retrieveCSV(url);
    };

    service.getPolygonFillData = function() {
      var url = ANNUAL_TIME_SERIES+service.summaryName()+'.'+service.polygonSource()+'.TimeSeries.mean.csv';
      return service.retrieveCSV(url);
    };

    service.getPieChartData = function(){
      var url = PIE_CHART_DATA+service.summaryName()+'.'+service.polygonSource()+'.DLCD.'+selection.year+'.sum.csv';
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
