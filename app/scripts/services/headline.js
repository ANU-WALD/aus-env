'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.headline
 * @description
 * # headline
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('headline', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var headline = this;

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
    headline.headlines = {
      //headline indicators?
      //environmental accounts?
      selected:"Straight to Page",
      headlines: [
        {
          name:"Straight to Page",
          description:"Closes the headline view.",
          behaviour:{ }
        },
        {
          name:"Region Focus",
          description:"Select a location",
          behaviour:
          {
            locations:
              [
                {name:"ACT",llz:[-35.522,148.801,10]},
                {name:"NSW",llz:[-32.750,142.827,6]},
                {name:"QLD",llz:[-20.147,139.510,5.75]}
              ]
          }
        },
        {
          name:"Land Use/Cover Change",
          description:"2014 to 2015 land use and cover change",
          behavior:
          {

          }
        },
        {
          name:"Bushfire",
          description:"Bushfires for 2015",
          behavior:{}
        },
        {
          name:"Weather and Water",
          description:"Weather and Water relationship for 2015",
          behavior:{}
        },
        {
          name:"Rivers and Wetlands",
          description:"River and wetland health",
          behavior:{}
        },
        {
          name:"Agricultural Land",
          description:"Wheat or Corn?",
          behavior:{}
        },
        {
          name:"Natural Ecosystems",
          description:"Not Urban",
          behavior:{}
        },
        {
          name:"The Carbon Balance",
          description:"Is not good",
          behavior:{}
        },
      ]
    };  //json headlines


  });
