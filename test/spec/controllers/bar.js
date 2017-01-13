'use strict';

describe('Controller: BarCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var BarCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BarCtrl = $controller('BarCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));
});
