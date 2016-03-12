'use strict';

describe('Controller: ThechartsCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var ThechartsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ThechartsCtrl = $controller('ThechartsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
