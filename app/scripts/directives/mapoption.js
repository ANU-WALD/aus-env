'use strict';

/**
 * @ngdoc directive
 * @name ausEnvApp.directive:mapoption
 * @description
 * # mapoption
 */
angular.module('ausEnvApp')
  .directive('mapoption', function ($timeout) {
    return {
      scope:{
        width:'=',
        label:'=',
        item:'=',
        options:'='
      },
      templateUrl: 'views/mapoption.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        scope.enterDropDown=function(){
          scope.isOpen=true;
        };

        scope.exitDropDown=function(name){
          scope.isOpen='closing';
          $timeout(function(){
            if(scope.isOpen==='closing'){
              scope.isOpen=false;
            }
          },250);
        };

        scope.setItem = function(i){
          scope.item=i;
        }
      },
    };
  });
