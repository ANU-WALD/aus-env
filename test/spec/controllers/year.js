'use strict';

describe('Controller: YearCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var YearCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    YearCtrl = $controller('YearCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));
});
