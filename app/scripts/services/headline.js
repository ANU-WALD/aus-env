'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.headline
 * @description
 * # headline
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('headline', function ($http, bugs) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var headline = this;
    const headline_data_file = "static/behaviourdata/headlines.json";

    function readsuccess(response) {
      headline.headlines = angular.fromJson(response.data);
      //console.log(response.data);
    }
    function readfail(response) {
      headline.headlines = angular.fromJson("{}");
      bugs.addBug("Cannot find " + headline_data_file, response.data);
      //console.error("Cannot read " + headline_data_file)
    }
    $http.get(headline_data_file).then(readsuccess,readfail);

    headline.isSelected = function(hd) {
      //console.log(headline.headlines);
      //return true;
      return (hd.name === headline.headlines.selected);
    };

    headline.headlineByName = function(name) {
      //angular.forEach(headline.headlines.headlines,function)  one way to iterate?
    }

  });
