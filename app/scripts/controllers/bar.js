'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:BarCtrl
 * @description
 * # BarCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('BarCtrl', function ($scope,$log,selection,details,downloads) {
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

    $scope.assignBarChartColours = function(barLabels){
      var firstYear = barLabels[0];
      var currentYearIndex = selection.year - firstYear;
      // +++TODO: Extract to respond to changed year...
      // +++TODO: Tidy up!
      for (var i=0; i<barLabels.length; i++) {
        if (selection.year === parseInt(barLabels[i])) {
          currentYearIndex = i;
          break;
        }
      }

      var barColors = [{fillColor:[details.themeColours.lightGreen]}];
      barColors[0].fillColor[currentYearIndex] = details.themeColours.darkGreen;

      if (currentYearIndex < barLabels.length-1) {
        barColors[0].fillColor[currentYearIndex+1] = details.themeColours.lightGreen;
      }

      return barColors;
    };

    $scope.adjustColours = function(){
      $scope.barOptions.animation = false;
      $scope.barColors = $scope.assignBarChartColours($scope.barLabels);
    };

    $scope.ensureGoodScale = function(data,units){
      $scope.barOptions.scaleOverride = false;

      if(!data || !data.length){
        return;
      }

      if(!((units==='percent')||(units==='%'))){
        return;
      }

      var vals = data.map(function(e){return e.value;});
      var max = Math.max.apply(null, vals);
      var min = Math.min.apply(null, vals);

      if(max>99){
        var axisMax = 100;
        var axisMin = Math.min(90,10*Math.floor(min/10.0));
        var nSteps=5;
        var step = (axisMax-axisMin)/nSteps;
        $scope.barOptions.scaleOverride = true;
        $scope.barOptions.scaleSteps = nSteps;
        $scope.barOptions.scaleStepWidth = step;
        $scope.barOptions.scaleStartValue = axisMin;
      }
    };

    $scope.createBarChart = function(){
      $scope.barOptions.animation = true;
      $scope.bar.loading=true;
      $scope.getBarData().then(function(data){
        var barData = data[0];
        var metadata = data[1];

        $scope.barOptions.animation = true;

        $scope.ensureGoodScale(barData,metadata.Units);

        $scope.barData = [barData.map(function(e){return isNaN(e.value)?0.0:e.value;})];
        $scope.barLabels = barData.map(function(e){return e.label;});
        $scope.barSeries = [metadata.label];
        $scope.adjustColours();
        details.populateLabels($scope.bar,metadata);

        $scope.bar.download = downloads.downloadableTable(barData.map(function(line){return [line.label,line.value];}),['Year','Value']);
        $scope.bar.download_fn = downloads.makeDownloadFilename($scope.locationLabel(),$scope.bar.title,'annual');
        $scope.bar.loading=false;
      },function(){
        $scope.barData = [];
        $scope.barLabels = [];
        $scope.barSeries = [];
        $scope.bar = details.chartMetaData();
        $scope.bar.loading=false;
      });
    };

    $scope.watchList.forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.createBarChart);
    });

    $scope.$watch('selection.dataMode',$scope.createBarChart);

    $scope.$watch('selection.year',$scope.adjustColours);
  });
