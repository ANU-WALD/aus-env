'use strict';

describe('Controller: LayerswitcherCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var LayerswitcherCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LayerswitcherCtrl = $controller('LayerswitcherCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
  });
});
