'use strict';

describe('Controller: LocationselectionCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var LocationselectionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LocationselectionCtrl = $controller('LocationselectionCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

});
