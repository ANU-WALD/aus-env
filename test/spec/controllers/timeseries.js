'use strict';

describe('Controller: TimeseriesCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var TimeseriesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TimeseriesCtrl = $controller('TimeseriesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));
});
