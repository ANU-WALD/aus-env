'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.details
 * @description
 * # details
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('details', function ($q,$http) {
    var service = this;

    service.getBarChartData = function(layer,foci){
      var result = $q.defer();
      var url = 'static/summary/'+layer+'/'+foci+'.csv';
      var httpPromise = $http.get(url);

      httpPromise.then(function(resp){
        var text = resp.data;
        var lines = text.split('\n');
        var header = lines.shift();
        var columns = header.split(',');
        columns.shift();
        var data = {};
        lines.forEach(function(line){
          var cols = line.split(',');
          var polygonName = cols.shift();
          data[polygonName] = cols.map(function(val){return +val;});
        });
        data.columnNames = columns;
        result.resolve(data);
      });

      return result.promise;
    };
  });
