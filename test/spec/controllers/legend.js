'use strict';

describe('Controller: LegendCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var LegendCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LegendCtrl = $controller('LegendCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(LegendCtrl.awesomeThings.length).toBe(3);
  });
});
