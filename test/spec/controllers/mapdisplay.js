'use strict';

describe('Controller: MapdisplayCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var MapdisplayCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MapdisplayCtrl = $controller('MapdisplayCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(MapdisplayCtrl.awesomeThings.length).toBe(3);
  });
});
