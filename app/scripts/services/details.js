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

    service.getBarChartData = function(the_summary, the_source){
      var result = $q.defer();
      var url = 'static/summary/'+the_summary+'.'+the_source+'.csv';
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
          var polygonIdentifier = "abc" + cols.shift();
          data[polygonIdentifier] = cols.map(function(val){return +val;}); //convert the numbers of type string into the actual numbers

        });

        data.columnNames = columns;
        console.log(data);
        result.resolve(data);
      });

      return result.promise;
    };

  });
