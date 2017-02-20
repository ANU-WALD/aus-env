'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.details
 * @description
 * # details
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('details', function ($q,$http,$window,$interpolate,staticData,selection,csv) {
    var service = this;

    var STATIC_CSV_SOURCE='/aucsv/accounts/';
    var ANNUAL_TIME_SERIES=STATIC_CSV_SOURCE;
    var REGION_AREAS='/aucsv/region_areas/';
    var PIE_CHART_DATA=STATIC_CSV_SOURCE;
    service.dap = $window.dap;
    service.MAX_CACHE_LENGTH=20;
    service.cache = [];

    service.themeColours = {
      lightGreen:'#66987F',
      darkGreen:'#2B5F45'
    };

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
      },function(){
          result.reject();
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

    service.summaryName = function(key) {
      var summaryName = null;
      key = key || 'summary';
      if(selection.selectedLayer[selection.dataModeConfig()]){
        var source = selection.selectedLayer[selection.dataModeConfig()];
        summaryName = source[key] || source.summary;
      }
      summaryName = summaryName || selection.selectedLayer[key] || selection.selectedLayer.summary;
      return summaryName;
    };

    service.polygonSource = function(regionType) {
      regionType = regionType || selection.regionType;
      return regionType.summaryName || regionType.source;
    };

    service.getPolygonAnnualTimeSeries = function(regionType){
      var result = $q.defer();
      $q.all([selection.getSelectedLayer(),selection.getRegionType()]).then(function(){
        var url = ANNUAL_TIME_SERIES;
        var summaryName = service.summaryName('annualSummary');
        if(summaryName===null){
          result.reject();
          return result.promise;
        }

        if(summaryName.indexOf('{{')>=0){
          url += $interpolate(summaryName)({
            regionType:service.polygonSource(regionType)
          });
        } else {
          url += summaryName+'.'+service.polygonSource(regionType)+'.TimeSeries.mean.csv';
        }
        result.resolve(service.retrieveCSV(url));
      });

      return result.promise;
    };

    service.getPolygonFillData = function() {
      return service.getPolygonAnnualTimeSeries();
    };

    service.getPieChartData = function(){
      var result = $q.defer();

      var summaryName = service.summaryName();

      if(summaryName===null){
        result.reject();
        return result.promise;
      }

      if(summaryName.length) {
        summaryName += '.';
      }
      var url = PIE_CHART_DATA+summaryName+service.polygonSource()+'.DLCD.'+selection.year+'.sum.csv';
      var mainData = service.retrieveCSV(url);
      var landCover = service.landCoverCodes();

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
      var url = REGION_AREAS+service.polygonSource()+'.csv';
      return service.retrieveCSV(url);
    };

    service.landCoverCodes = staticData.deferredGet(service,'static/config/DLCD_codes.csv','_landcoverText',function(text){
      return csv.parseRegularCSV(text,'',true);
    });

    service.patchOnly = function(){
      return $q.resolve([
        {
          Class_Name:'',
          Red:156,
          Green:25,
          Blue:31
        }
      ]);
    };
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
    unit_dict.km2 = "km^2";

    service.unitsText = function(units) {
      var text = (units in unit_dict) ? unit_dict[units] : units;
      text = text.replace(/\^(-?[1-9])/g,'<sup>$1</sup>');
      return text;
    };

    service.clearChart = function(chart){
      chart.title = null;
      chart.description = null;
      chart.units = null;
      chart.originalUnits = null;
      chart.download = null;
      chart.downloadThis = null;

      return chart;
    };

    service.chartMetaData = function(){
      return service.clearChart({});
    };

  service.formatValue = function(val,decimalPlaces){
    if(!val){
      if(val===0){
        return '0';
      }
      return '-';
    }
    // Add thousand's separator. Source: http://stackoverflow.com/a/2901298
    var parts = val.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if(decimalPlaces===0){
      return parts[0];
    }

    if((decimalPlaces!==null) &&(decimalPlaces!==undefined) && (parts.length===2)){
      parts[1] = parts[1].substr(0,decimalPlaces);
    }
    return parts.join(".");
  };

    service.tooltipSafeUnits = function(chart){
      if(chart.units.indexOf('<su')>=0) {
        return chart.originalUnits;
      } else {
        return chart.units;
      }
    };

    service.populateLabels = function(chart,data){
        chart.title = data.Title;
        chart.description = data.Description;
        chart.units = service.unitsText(data.Units);
        chart.originalUnits = data.Units;
        /*
        if(chart === $scope.bar) {
          $scope.viewOptions[0].description = chart.description;
        } else if(chart === $scope.pie) {
          $scope.viewOptions[1].description = chart.description;
        }
        */
    };

    service.tooltipTextFunction = function(chart){
      return function(label){
        return label.label + ':' + service.formatValue(label.value) + ' ' + service.tooltipSafeUnits(chart);
      };
    };
  });
