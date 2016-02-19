'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:ThemeswitcherCtrl
 * @description
 * # ThemeswitcherCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('ThemeswitcherCtrl', function ($scope,staticData,themes,selection) {
    staticData.unwrap($scope,'themes',themes.themes);

    $scope.iconMapping = {
      degrading:'arrow-down',
      improving:'arrow-up',
      constant:'arrow-right'
    };

    $scope.selectTheme = function(newTheme) {
      selection.theme = newTheme.name;
      selection.themeObject = newTheme;
    };

    $scope.themeClasses = function(theme){
      var result = "theme-"+theme.status;
      if(theme===selection.themeObject) {
        result += ' selection-button-selected';
      }
      return result;
    };

//    $scope.themeDirection = function(theme){
//
//    };
  });
