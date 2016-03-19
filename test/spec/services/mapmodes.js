'use strict';

describe('Service: mapmodes', function () {

  // load the service's module
  beforeEach(module('ausEnvApp'));

  // instantiate service
  var mapmodes;
  beforeEach(inject(function (_mapmodes_) {
    mapmodes = _mapmodes_;
  }));

  it('should do something', function () {
    expect(!!mapmodes).toBe(true);
  });

});
