'use strict';

describe('Controller: ZoomCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var ZoomCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ZoomCtrl = $controller('ZoomCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ZoomCtrl.awesomeThings.length).toBe(3);
  });
});
