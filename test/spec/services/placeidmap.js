'use strict';

describe('Service: placeidmap', function () {

  // load the service's module
  beforeEach(module('ausEnvApp'));

  // instantiate service
  var placeidmap;
  beforeEach(inject(function (_placeidmap_) {
    placeidmap = _placeidmap_;
  }));

  it('should do something', function () {
    expect(!!placeidmap).toBe(true);
  });

});
