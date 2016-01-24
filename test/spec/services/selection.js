'use strict';

describe('Service: selection', function () {

  // load the service's module
  beforeEach(module('ausEnvApp'));

  // instantiate service
  var selection;
  beforeEach(inject(function (_selection_) {
    selection = _selection_;
  }));

  it('should do something', function () {
    expect(!!selection).toBe(true);
  });

});
