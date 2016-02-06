'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:HeadlinesCtrl
 * @description
 * # HeadlinesCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('HeadlinesCtrl', function ($scope) {

    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.blah = "blah blah";

    $scope.makeTooltip = function(headline) {
      return (headline.isSelected ? "(Current Headline)" : "") + headline.description;
    };

    $scope.headlines = {
      //headline indicators?
      //environmental accounts?
      headlines: [
        {
          name:"Straight to Page",
          description:"Closes the headline view.",
          isSelected:true,
          behaviour:{ }
        },
        {
          name:"Region Focus",
          description:"Select a location",
          isSelected:false,
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
          isSelected:false,
          behavior:
            {

            }
        },
        {
          name:"Bushfire",
          description:"Bushfires for 2015",
          isSelected:false,
          behavior:{}
        },
        {
          name:"Weather and Water",
          description:"Weather and Water relationship for 2015",
          isSelected:false,
          behavior:{}
        },
        {
          name:"Rivers and Wetlands",
          description:"River and wetland health",
          isSelected:false,
          behavior:{}
        },
        {
          name:"Agricultural Land",
          description:"Wheat or Corn?",
          isSelected:false,
          behavior:{}
        },
        {
          name:"Natural Ecosystems",
          description:"Not Urban",
          isSelected:false,
          behavior:{}
        },
        {
          name:"The Carbon Balance",
          description:"Is not good",
          isSelected:false,
          behavior:{}
        },
      ]
    };

  });
