'use strict';

describe('Controller: SharingCtrl', function () {

  // load the controller's module
  beforeEach(module('ausEnvApp'));

  var SharingCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SharingCtrl = $controller('SharingCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

});
