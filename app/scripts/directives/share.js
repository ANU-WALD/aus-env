'use strict';

/**
 * @ngdoc directive
 * @name ausEnvApp.directive:share
 * @description
 * # share
 */
angular.module('ausEnvApp')
  .directive('share', function () {
    return {
      scope: {
        url: '=',
        label:'='
      },
      templateUrl: 'views/sharecontrol.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        scope.onTextClick = function(evt){
          $event.target.select();
        };

        scope.copyToClipboard = function(){
          angular.element(element[0].querySelector('input')).select();
          try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
          } catch (err) {
            console.log('Oops, unable to copy');
          }
        };
      }
    };
  });
