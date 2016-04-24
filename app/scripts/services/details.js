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
    var REGION_AREAS='/aucsv/region_areas/';
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
      var httpPromise = $http.get(url,{params:{nocache:(new Date().toString())}});

      httpPromise.then(function(resp){
        var data = csv.parseCSVWithHeader(resp.data);
        data.URL = url;
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

    service.polygonSource = function(needRegion) {
      if(!needRegion||selection.haveRegion()) {
        return selection.regionType.summaryName || selection.regionType.source;
      } else {
        return "SA3_2011_AUST";
      }
    };

    service.getBarChartData = function(){
      var url = ANNUAL_TIME_SERIES+service.summaryName()+'.'+service.polygonSource(true)+'.TimeSeries.mean.csv';
      return service.retrieveCSV(url);
    };

    service.getPolygonFillData = function() {
      var url = ANNUAL_TIME_SERIES+service.summaryName()+'.'+service.polygonSource()+'.TimeSeries.mean.csv';
      return service.retrieveCSV(url);
    };

    service.getPieChartData = function(){
      var summaryName = service.summaryName();
      if(summaryName.length) {
        summaryName += '.';
      }
      var url = PIE_CHART_DATA+summaryName+service.polygonSource(true)+'.DLCD.'+selection.year+'.sum.csv';
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

    service.getRegionAreas = function() {
      var url = REGION_AREAS+service.polygonSource(true)+'.csv';
      return service.retrieveCSV(url);
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

    /*
  var unit_dict = [];
  unit_dict['frequency'] = "occurrences/year";
  unit_dict['percent'] = "%";
  unit_dict['percent'] = "%";
  unit_dict['m2/m2'] = "m" + "2".sup() + "/m" + "2".sup();
  unit_dict['gC/m2'] = "gC/m" + "2".sup();
  */

    var unit_dict = [];
//    unit_dict.frequency = "occurrences/year";
    unit_dict.percent = "%";
    unit_dict['m2/m2'] = "m^2/m^2";
    unit_dict['gC/m2'] = "gC/m^2";
    unit_dict['km2'] = "km^2";

    service.unitsText = function(units) {
      var text = (units in unit_dict) ? unit_dict[units] : units;
      text = text.replace(/\^2/g,'<sup>2</sup>');
      return text;
    };
  });
