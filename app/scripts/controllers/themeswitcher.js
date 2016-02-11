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

    $scope.selectTheme = function(newTheme) {
      selection.theme = newTheme.name;
      selection.themeObject = newTheme;
    }
  });
