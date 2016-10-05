'use strict';

describe('Service: timeseries', function () {

  // load the service's module
  beforeEach(module('ausEnvApp'));

  // instantiate service
  var timeseries;
  beforeEach(inject(function (_timeseries_) {
    timeseries = _timeseries_;
  }));

  it('find closest', function () {
    expect(timeseries.indexInDimension(5,[1,3,4,7,10,12])).toBe(2);
    expect(timeseries.indexInDimension(6,[1,3,4,7,10,12])).toBe(3);
    expect(timeseries.indexInDimension(10,[1,3,4,7,10,12])).toBe(4);
    expect(timeseries.indexInDimension(0.5,[1,3,4,7,10,12])).toBe(0);
    expect(timeseries.indexInDimension(1,[1,3,4,7,10,12])).toBe(0);
    expect(timeseries.indexInDimension(12,[1,3,4,7,10,12])).toBe(5);
    expect(timeseries.indexInDimension(15,[1,3,4,7,10,12])).toBe(5);
  });

  it('find closest in reversed list', function () {
    expect(timeseries.indexInDimension(5,[12,10,7,4,3,1],true)).toBe(3);
    expect(timeseries.indexInDimension(6,[12,10,7,4,3,1],true)).toBe(2);
    expect(timeseries.indexInDimension(10,[12,10,7,4,3,1],true)).toBe(1);
    expect(timeseries.indexInDimension(0.5,[12,10,7,4,3,1],true)).toBe(5);
    expect(timeseries.indexInDimension(1,[12,10,7,4,3,1],true)).toBe(5);
    expect(timeseries.indexInDimension(12,[12,10,7,4,3,1],true)).toBe(0);
    expect(timeseries.indexInDimension(15,[12,10,7,4,3,1],true)).toBe(0);
  });
});
