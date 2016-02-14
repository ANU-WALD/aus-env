'use strict';

angular.module('ausEnvApp')
  .factory('$exceptionHandler', function(bugs) {
    return function(exception, cause) {
      console.error(exception);
      console.error(cause);
      bugs.addBug(exception.message, exception.message, false);
    }
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
    var bugs = this;

    bugs.max = 5;
    bugs.nameLimit = 80;
    bugs.bugs = [];

    bugs.clearBugs = function() {
      bugs.bugs = [];
    };

    bugs.addBug = function(bug_name, bug_description, to_console_default_true) {
      var to_console = typeof to_console_default_true !== 'undefined' ?  to_console_default_true : true;
      var trimmed_name = $filter('limitTo')(bug_name, bugs.nameLimit);
      var new_bug = {
        name:trimmed_name,
        description:bug_description,
        time:Date.now()
      };

      if (bugs.bugs.length < bugs.max) {
        //console.log(bugs.bugs.length);
        bugs.bugs.push(new_bug);
        //console.log(bugs.bugs.length);
      } else {
        for(var i = 0; i < bugs.max-1; i++) { bugs.bugs[i] = bugs.bugs[i+1]; }
        bugs.bugs[bugs.max-1] = new_bug;
      } //if

      if (to_console) { console.log(new_bug); }
    };  //addBug

    bugs.hasBugs = function() { return ( bugs.bugs.length > 0); }

  });
