'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:BarCtrl
 * @description
 * # BarCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('BarCtrl', function ($scope,$log,$element,$timeout,selection,details,downloads) {
    $scope.selection = selection;
    $scope.bar = details.chartMetaData();
    $scope.barColors = [];
    $scope.barData = [];
    $scope.barLabels = [];

    $scope.assignBarChartColours = function(barLabels){

      return barLabels.map(function(lbl){
        if(parseInt(lbl)===selection.year){
          return details.themeColours.darkGreen;
        }
        return details.themeColours.lightGreen;
      })
    };

    $scope.adjustColours = function(){
      $scope.barColors = $scope.assignBarChartColours($scope.barLabels);
    };

    // $scope.ensureGoodScale = function(data,units){
    //   $scope.barOptions.scaleOverride = false;

    //   if(!data || !data.length){
    //     return;
    //   }

    //   if(!((units==='percent')||(units==='%'))){
    //     return;
    //   }

    //   var vals = data.map(function(e){return e.value;});
    //   var max = Math.max.apply(null, vals);
    //   var min = Math.min.apply(null, vals);

    //   if(max>99){
    //     var axisMax = 100;
    //     var axisMin = Math.min(90,10*Math.floor(min/10.0));
    //     var nSteps=5;
    //     var step = (axisMax-axisMin)/nSteps;
    //     $scope.barOptions.scaleOverride = true;
    //     $scope.barOptions.scaleSteps = nSteps;
    //     $scope.barOptions.scaleStepWidth = step;
    //     $scope.barOptions.scaleStartValue = axisMin;
    //   }
    // };

    $scope.clearChart = function(){
      $scope.barData = [];
      $scope.barLabels = [];
      $scope.barSeries = [];
      $scope.bar = details.chartMetaData();
      $scope.bar.loading=false;

      var target = $element[0];
      target = $('.bar-chart',target)[0];

      Plotly.purge(target);
    };


    $scope.createBarChart = function(){
      $scope.bar.loading=true;
      $scope.getBarData().then(function(data){
        var barData = data[0];
        var metadata = data[1];

        // $scope.ensureGoodScale(barData,metadata.Units);

        $scope.barData = barData.map(function(e){return isNaN(e.value)?0.0:e.value;});
        $scope.barLabels = barData.map(function(e){return e.label;});
        $scope.barSeries = [metadata.label];
        $scope.adjustColours();

        var target = $element[0];
        target = $('.bar-chart',target)[0];

        var range = details.dataRange($scope.barData,5,0,$scope.bar.units==='%'?100.0:undefined);

        $timeout(function(){
          $(target).one('plotly_afterplot', function(){
            details.populateLabels($scope.bar,metadata);
            $scope.bar.loading=false;
          });
          Plotly.newPlot( target, [{
            x: $scope.barLabels,
            y: $scope.barData,
            type: 'bar',
            text: $scope.barData.map(function(s,i){return $scope.barLabels[i]+':<br> '+ details.formatValue(s) + $scope.bar.units;}),
            hoverinfo: 'text',
            marker:{
              color:$scope.barColors
            }
          }], {
            height: 150,
            width: 270,
            margin: {
              l:40,
              r:10,
              b:30,
              t:10
            },
            xaxis:{
              tickmode:'array',
              tickvals:$scope.barLabels,
              ticktext:$scope.barLabels,
              tickangle:-60,
              tickfont:{
                size:11
              }
            },
            yaxis:{
              // rangemode:'normal',
              range: range
            },
            showlegend:false
          },{
            modeBarButtonsToRemove: ['hoverCompareCartesian','hoverClosestCartesian','lasso2d','select2d'],
            displayModeBar: false,
            displaylogo: false
          });
          Plotly.relayout( target, {
            'xaxis.autorange': true,
            'yaxis.autorange': false
        });
      });

        $scope.bar.download = downloads.downloadableTable(barData.map(function(line){return [line.label,line.value];}),['Year','Value']);
        $scope.bar.download_fn = downloads.makeDownloadFilename($scope.locationLabel(),$scope.bar.title,'annual');
        $scope.bar.loading=false;
      },$scope.clearChart);
    };

    $scope.watchList.forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.createBarChart);
    });

    $scope.$watch('selection.dataMode',$scope.createBarChart);

    $scope.$watch('selection.year',$scope.adjustColours);
  });
