'use strict';

describe('Controller: PieCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var PieCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PieCtrl = $controller('PieCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));
});
