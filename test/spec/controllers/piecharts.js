'use strict';

describe('Controller: PiechartsCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var PiechartsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PiechartsCtrl = $controller('PiechartsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
