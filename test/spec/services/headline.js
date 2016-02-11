'use strict';

describe('Service: headline', function () {

  // load the service's module
  beforeEach(module('ausEnvApp'));

  // instantiate service
  var headline;
  beforeEach(inject(function (_headline_) {
    headline = _headline_;
  }));

  it('should do something', function () {
    expect(!!headline).toBe(true);
  });

});
