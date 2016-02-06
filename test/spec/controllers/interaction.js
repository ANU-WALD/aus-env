'use strict';

describe('Controller: InteractionCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var InteractionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InteractionCtrl = $controller('InteractionCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
