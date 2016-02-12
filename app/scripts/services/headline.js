'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.headline
 * @description
 * # headline
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('headline', function ($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var headline = this;
    var headline_data_file = "static/behaviourdata/headlines.json";

    //JSON.parse();
    function readsuccess(response) {
      console.log(response.data);
    }
    function readfail(response) {
      console.error("Cannot read " + headline_data_file)
    }
    $http.get(headline_data_file).then(readsuccess,readfail);

    headline.isSelected = function(headline) {
      return headline.name.localeCompare($scope.headlines.selected) === 0;
    };

    headline.makeTooltip = function(headline) {
      return ($scope.isSelected(headline) ? "(Current Headline)" : "") + headline.description;
    };

    headline.headlineFromName = function(name) {

    };

    headline.headlineFromID = function(id) {

    };

    // Note to self - integrate into themes or write a service for this (my preference)
    //   A headline may use a theme, or may do it's own thing.
    //   A service would make integrating with the modal and other page elements more sensible
    headline.headlines = {}


  });
