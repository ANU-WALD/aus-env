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
      degrading:'fa-arrow-down',
      improving:'fa-arrow-up',
      constant:'fa-arrow-right'
    };

    $scope.selectTheme = function(newTheme) {
      selection.theme = newTheme.name;
      selection.themeObject = newTheme;
      selection.navbarCollapsed = true;
    };

    $scope.themeClasses = function(theme){
      var result = "theme-"+theme.status;
      if(theme===selection.themeObject) {
        result += ' selection-button-selected';
      }
      return result;
    };

    $scope.themeDirection = function(theme){
      console.log(theme);
      return $scope.iconMapping[theme.status];
    };

    $scope.selectThemeAndLayer = function(theme,layer) {
      $scope.selectTheme(theme);
      $scope.selection.selectedLayerName = layer.title;
      $scope.selection.selectedLayer = layer;
    };
  });
