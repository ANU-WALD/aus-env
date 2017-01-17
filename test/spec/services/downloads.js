'use strict';

describe('Service: downloads', function () {

  // load the service's module
  beforeEach(module('ausEnvApp'));

  // instantiate service
  var downloads;
  beforeEach(inject(function (_downloads_) {
    downloads = _downloads_;
  }));
});
