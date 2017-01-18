'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.downloads
 * @description
 * # downloads
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('downloads', function () {
    var service = this;

    service.downloadableText = function(txt){
      return "data:text/plain;charset=utf-8,"+encodeURIComponent(txt);
    };

    service.timeseriesToCSV = function(data){

    };

    service.pieDataToCSV = function(data){

    };

    service.tableToCSV = function(data,labels){
      var result = labels.join(',')+'\n'+data.map(function(entry){return entry.join(',')}).join('\n');
      return result;
    };

    service.downloadableTimeSeries = function(data){
      return service.downloadableText(service.timeseriesToCSV(data));
    };

    service.downloadableTable = function(data,labels){
      return service.downloadableText(service.tableToCSV(data,labels));
    };

    service.makeDownloadFilename = function(loc,title){
      var result = loc + '_' + title + '.csv';
      result = result.replace(/&deg;/g,'');
      result = result.replace(/,/g,'-');
      return result;
    }
  });
