'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:HeadlinesCtrl
 * @description
 * # HeadlinesCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('HeadlinesCtrl', function ($scope, $uibModal, $log) {

    $scope.$log = $log;

    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.blah = "blah blah";
    //$scope.items = ['item1', 'item2', 'item3'];

    //using the modal is good example of handling a promise
    //Note I've un-anonymized the functions to make it clearer
    //Note also the use of <script type="text/ng-template" id="/headlineModalTemplate.html">
    // <a href="#" ng-click="$event.preventDefault(); selected.item = item">{{ item }}</a>
    $scope.doModal = function() {
      var modalInstance = $uibModal.open({  //now wait for the promise - see result.then below
        templateUrl: 'headlineModalTemplate.html',
        controller: 'ModalInstanceCtrl',
        resolve: {
          headlines: function () {
            return $scope.headlines;
          }
        }
      });

      function resolved(selectedItem) {
        $scope.headlines.selected = selectedItem;
      }
      function rejected()
      {
        $log.info('Modal Closed No Choices');
      }
      modalInstance.result.then(resolved, rejected);  //the promise
    };

    $scope.isSelected = function(headline) {
      return headline.name.localeCompare($scope.headlines.selected) === 0;
    };

    $scope.makeTooltip = function(headline) {
      return ($scope.isSelected(headline) ? "(Current Headline)" : "") + headline.description;
    };

    // Note to self - integrate into themes or write a service for this (my preference)
    //   A headline may use a theme, or may do it's own thing.
    //   A service would make integrating with the modal and other page elements more sensible
    $scope.headlines = {
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
    };

  });



angular.module('ausEnvApp')
  .controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, headlines) {

  $scope.headlines = headlines;
  //console.log(headlines);

  $scope.ok = function (selectedHeadline) {
    $uibModalInstance.close(selectedHeadline);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
