'use strict';

//copy from http://stackoverflow.com/questions/20666900/using-bootstrap-tooltip-with-angularjs

/**
 * @ngdoc service
 * @name ausEnvApp.tooltip
 * @description
 * # tooltip
 * Directive to helps show tooltips on elements for AngularJS
 * Add the following attributes to your element:
 *   title="My Tooltip!" data-toggle="tooltip" data-placement="top" tooltip
 */
angular.module('ausEnvApp').directive('tooltip', function(){
  return {
    restrict: 'A',
    link: function(scope, element, attrs){
      $(element).hover(function(){
        // on mouseenter
        $(element).tooltip('show');
      }, function(){
        // on mouseleave
        $(element).tooltip('hide');
      });
    }
  };
});
