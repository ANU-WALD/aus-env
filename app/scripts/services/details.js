'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.details
 * @description
 * # details
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('details', function ($q,$http,$window,$interpolate,staticData,selection,csv,environment) {
    var service = this;

    var ANNUAL_TIME_SERIES=environment.STATIC_CSV_SOURCE;
    var PIE_CHART_DATA=environment.STATIC_CSV_SOURCE;
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
      return regionType && (regionType.summaryName || regionType.source);
    };

    service.getPolygonAnnualTimeSeries = function(regionType,mode){
      var result = $q.defer();
      var datamode = mode||
        (selection.dataModeConfig()==='rank'?'rank':'mean');

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
          url += summaryName+'.'+service.polygonSource(regionType)+'.TimeSeries.'+datamode+'.csv';
        }
        result.resolve(service.retrieveCSV(url));
      });

      return result.promise;
    };

    service.getPolygonFillData = function() {

      if(selection.selectedLayer.disableAnnual){
        var url = service.pieChartURL();
        var csv = service.retrieveCSV(url);
        if(selection.selectedLayer.normaliseSummary){
          var result = $q.defer();
          csv.then(function(data){
            data = JSON.parse(JSON.stringify(data));
            data.Units = '%';
            delete data.Title;
            Object.keys(data).filter(function(n){return n.startsWith('PlaceIndex')&&n!=='PlaceIndex';})
              .forEach(function(key){
                var sum = data[key].reduce(function(a,b){return a+b;});
                var multiplier = 100.0 / (sum||1.0);
                data[key] = data[key].map(function(v){return v * multiplier;});
              });
            result.resolve(data);
          });
          return result.promise;

        }
        return csv;
      }

      return service.getPolygonAnnualTimeSeries();
    };

    service.pieChartURL = function(){
      var summaryName = service.summaryName();

      if(summaryName===null){
        result.reject();
        return result.promise;
      }

      if(summaryName.length) {
        summaryName += '.';
      }
      var url = PIE_CHART_DATA+summaryName+
          service.polygonSource()+
          '.'+environment.BY_LAND_TYPE_SUMMARY;

      if(!selection.selectedLayer.disableAnnual){
        url += '.'+selection.year;
      }
      url += '.sum.csv';
      return url;
    }

    service.scaleDataSet = function(data,scale){
      var result = {};
      Object.keys(data).forEach(function(k){
        if(k.startsWith('PlaceIndex')&&(k!=='PlaceIndex')){
          result[k] = data[k].map(function(v){return v*scale;});
        } else {
          result[k] = data[k];
        }
      });
      return result;
    }

    service.getPieChartData = function(){
      var result = $q.defer();
      var units = selection.selectedLayer.summaryUnits;
      var scale = selection.selectedLayer.summaryScale;
      var url = service.pieChartURL();
      var mainData = service.retrieveCSV(url);
      var landuse = service.landUseCodes();

      $q.all([mainData,landuse]).then(function(results){
        var data = results[0];
        data.Units = units || data.Units;
        if(scale){
          data = service.scaleDataSet(data,scale);
        }

        data.columnNames = data.columnNames.map(function(c){return +c;});
        var landTypeCodes = results[1];
        data.columnPresentation = landTypeCodes;
        result.resolve(data);
      });
      return result.promise;
    };

    service.getRegionAreas = function() {
      var url = environment.REGION_AREAS+service.polygonSource()+'.csv';
      return service.retrieveCSV(url);
    };

    service.landCoverCodes = staticData.deferredGet(service,environment.LANDCOVER_CODES,'_landcoverText',function(text){
      return csv.parseRegularCSV(text,'',true);
    });

    service.landUseCodes = staticData.deferredGet(service,environment.LANDUSE_CODES,'_landuseText',function(text){
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

    service.populateLabels = function(chart,data,altUnits){
        chart.title = data.Title;
        chart.description = data.Description;
        chart.units = service.unitsText(altUnits||data.Units);
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

    service.axisRange = function(values,units){
      if(units!=='%'){
        return undefined;
      }
      var actualVals = values.filter(function(v){
        return !isNaN(v);
      });
      var max = Math.max.apply(null, actualVals);
      var min = Math.min.apply(null, actualVals);
      if(max>99){
        return [Math.min(95,20*Math.floor(min/20.0)),100];
      }
      return undefined;
    };

    service.dataRange = function(values,units){
      var min = units==='&deg;C'?undefined:0.0;
      var max = units==='%'?100:undefined;
      var buffer = 5;

      var actualVals = values.filter(function(v){
        return !isNaN(v);
      });
      var maximum = Math.max.apply(null, actualVals) + buffer;
      var minimum = Math.min.apply(null, actualVals) - buffer;

      if(min!==undefined){
        minimum = Math.max(min,minimum);
      }

      if(max!==undefined){
        maximum = Math.min(max,maximum);
      }

      return [minimum,maximum];
    }
  });
