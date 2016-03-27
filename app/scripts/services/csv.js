'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.csv
 * @description
 * # csv
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('csv', function () {
    var service = this;

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
      idPrefix = (idPrefix===undefined)? 'PlaceIndex' : idPrefix;
      var data = {};
      var lines = text.split('\n');
      var header = lines.shift();
      var columns = header.split(',').map(Function.prototype.call,String.prototype.trim);
      columns.shift();

      var parseValue = function(val){
        if(val==='-9999'){
          return null;
        }

        var num = +val;
        if(isNaN(num)){
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
  });
