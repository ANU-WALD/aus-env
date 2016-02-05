'use strict';

describe('Service: themes', function () {

  // load the service's module
  beforeEach(module('ausEnvApp'));

  // instantiate service
  var themes;
  beforeEach(inject(function (_themes_) {
    themes = _themes_;
  }));

  it('should do something', function () {
    expect(!!themes).toBe(true);
  });

});
