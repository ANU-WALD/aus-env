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
      template: `<div class="row row-min-padding">
      <div class="col-xs-12 col-sm-12 col-md-3">
       <label class="pull-right-lg"><span >{{label}}</span></label>
      </div>
      <div class="col-xs-10 col-sm-10 col-md-7">
        <input type="text"
               readonly
               class="form-control"
               ng-model="url"
               ng-click="onTextClick($event)">
      </div>
      <div class="col-xs-2 col-sm-2 col-md-2">
        <button type="button"
                class="btn btn-primary" ng-click="copyToClipboard()"
                uib-tooltip="Zoom to selected region" tooltip-append-to-body="true"
                tooltip-placement="bottom">
                  <span class="hidden-xs">Copy</span>
                  <i class="visible-xs fa fa-copy"></i>
        </button>
      </div>
    </div>`,
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
