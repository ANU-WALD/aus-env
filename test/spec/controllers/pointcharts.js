'use strict';

describe('Controller: PointchartsCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var PointchartsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PointchartsCtrl = $controller('PointchartsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

});
