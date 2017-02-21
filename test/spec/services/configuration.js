'use strict';

describe('Service: configuration', function () {

  // load the service's module
  beforeEach(module('ausEnvApp'));

  // instantiate service
  var configuration;
  beforeEach(inject(function (_configuration_) {
    configuration = _configuration_;
  }));

  it('should do something', function () {
    expect(!!configuration).toBe(true);
  });

});
