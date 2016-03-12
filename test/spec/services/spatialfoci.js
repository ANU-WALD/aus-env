'use strict';

describe('Service: spatialFoci', function () {

  // load the service's module
  beforeEach(module('ausEnvApp'));

  // instantiate service
  var spatialFoci;
  beforeEach(inject(function (_spatialFoci_) {
    spatialFoci = _spatialFoci_;
  }));

  it('should do something', function () {
    expect(!!spatialFoci).toBe(true);
  });

});
