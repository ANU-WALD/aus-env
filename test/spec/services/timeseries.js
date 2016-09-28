'use strict';

describe('Service: timeseries', function () {

  // load the service's module
  beforeEach(module('ausEnvApp'));

  // instantiate service
  var timeseries;
  beforeEach(inject(function (_timeseries_) {
    timeseries = _timeseries_;
  }));

  it('should do something', function () {
    expect(!!timeseries).toBe(true);
  });

});
