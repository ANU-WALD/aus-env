'use strict';

describe('Service: colourschemes', function () {

  // load the service's module
  beforeEach(module('ausEnvApp'));

  // instantiate service
  var colourschemes;
  beforeEach(inject(function (_colourschemes_) {
    colourschemes = _colourschemes_;
  }));

  it('should do something', function () {
    expect(!!colourschemes).toBe(true);
  });

});
