'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:HeadlinesCtrl
 * @description
 * # HeadlinesCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('HeadlinesCtrl', function ($scope, $uibModal, $log, headline, bugs) {

    //$scope.$log = $log;
    //$scope.headlineService = headline;

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
          headlineService: function () {
            return headline;
          }
        }
      });

      function resolved(selectedItem) {
        headline.headlines.selected = selectedItem;
      }
      function rejected()
      {
        $log.info('Modal Closed No Choices');
        bugs.addBug("test","a description of this")
      }
      modalInstance.result.then(resolved, rejected);  //the promise
    };

  });


/**
 * @ngdoc function
 * @name ausEnvApp.controller:ModalInstanceCtrl
 * @description
 * # ModalInstanceCtrl
 * Controller for the headlines modal form
 */
angular.module('ausEnvApp')
  .controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, headlineService) {


    $scope.headlineService = headlineService;
    //console.log(headlines);

    $scope.setHeadline = function(selectedHeadline) {
      headlineService.headlines.selected = selectedHeadline;
    };

    //btn btn-primary
    $scope.setButtonClass = function(headline) {
      //console.log("btn btn-" + (headlineService.isSelected(headline) ? "success" : "primary"));
      return "btn btn-" + (headlineService.isSelected(headline) ? "success" : "primary");
    };

    $scope.makeTooltip = function(headline) {
      return (headlineService.isSelected(headline) ? "(Current Headline)" : "") + headline.description;
    };

    $scope.getSelectedDescrition = function() {
      //return
    };

    $scope.ok = function () {
      $uibModalInstance.close();
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
});
