'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:BarCtrl
 * @description
 * # BarCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('BarCtrl', function ($scope,$log,selection,details) {
    $scope.selection = selection;
    $scope.bar = details.chartMetaData();
    $scope.barColors = [];
    $scope.barData = [];
    $scope.barLabels = [];
    $scope.barOptions =   {
      // Sets the chart to be responsive
      responsive: true,

      //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
      scaleBeginAtZero : false,

      //Boolean - Whether grid lines are shown across the chart
      scaleShowGridLines : true,

      //String - Colour of the grid lines
      scaleGridLineColor : "rgba(0,0,0,.05)",

      //Number - Width of the grid lines
      scaleGridLineWidth : 1,

      //Boolean - If there is a stroke on each bar
      barShowStroke : true,

      //Number - Pixel width of the bar stroke
      barStrokeWidth : 0.1,

      //Number - Spacing between each of the X value sets
      barValueSpacing : 2,

      //Number - Spacing between data sets within X values
      barDatasetSpacing : 1,

      animation:true,
      scaleLabel: "      <%=value%>"
    };

    $scope.barOptions.tooltipTemplate = details.tooltipTextFunction($scope.bar);

    $scope.adjustColours = function(){
      $scope.barOptions.animation = false;
      $scope.barColors = details.assignBarChartColours($scope.barLabels);
    };

    $scope.createBarChart = function(){
      $scope.barOptions.animation = true;
      $scope.getBarData().then(function(data){
        var barData = data[0];
        var metadata = data[1];

        $scope.barOptions.animation = true;
        $scope.barData = [barData.map(function(e){return e.value;})];
        $scope.barLabels = barData.map(function(e){return e.label;});
        $scope.barSeries = [metadata.label];
        $scope.adjustColours();
        details.populateLabels($scope.bar,metadata);
      });
    };

    $scope.watchList.forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.createBarChart);
    });

    $scope.$watch('selection.year',$scope.adjustColours);
  });
