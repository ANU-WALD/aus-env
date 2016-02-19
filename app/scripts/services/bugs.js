'use strict';

angular.module('ausEnvApp')
  .factory('$exceptionHandler', function(bugs) {
    return function(exception, cause) {
      console.error(exception);
      console.error(cause);
      bugs.addBug(exception.message, exception.message, false);
    };
  }); //factory

/**
 * @ngdoc service
 * @name ausEnvApp.bugs
 * @description
 * # bugs
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('bugs', function bugs($filter) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var service = this;

    service.max = 5;
    service.nameLimit = 80;
    service.bugs = [];

    service.clearBugs = function() {
      service.bugs = [];
    };

    service.addBug = function(bug_name, bug_description, to_console_default_true) {
      var to_console = typeof to_console_default_true !== 'undefined' ?  to_console_default_true : true;
      var trimmed_name = $filter('limitTo')(bug_name, service.nameLimit);
      var new_bug = {
        name:trimmed_name,
        description:bug_description,
        time:Date.now()
      };

      if (service.bugs.length < service.max) {
        //console.log(bugs.bugs.length);
        service.bugs.push(new_bug);
        //console.log(bugs.bugs.length);
      } else {
        for(var i = 0; i < service.max-1; i++) { service.bugs[i] = service.bugs[i+1]; }
        service.bugs[service.max-1] = new_bug;
      } //if

      if (to_console) { console.log(new_bug); }
    };  //addBug

    service.hasBugs = function() { return ( service.bugs.length > 0); };

  });
