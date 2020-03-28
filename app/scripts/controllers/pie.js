'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:PieCtrl
 * @description
 * # PieCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('PieCtrl', function ($scope,$element,$timeout,details,downloads,selection) {
    $scope.pie = details.chartMetaData();
    $scope.pie.sum=null;
    $scope.pieData = [];
    $scope.pieLabels = [];

    $scope.clearChart = function(){
      $scope.pie = details.chartMetaData();
      $scope.pieData=[];
      $scope.pieLabels = [];
      $scope.pie.loading=false;

      var target = $element[0];
      target = $('.pie-chart',target)[0];

      Plotly.purge(target);
    };

    $scope.createChart = function(){
      $scope.pie.loading=true;
      $scope.pie.year = ''

      if(selection.selectedLayer&&selection.selectedLayer.disablePie){
        $scope.chartView('pie',false);
        $scope.clearChart();
        return;
      }

      $scope.getPieData().then(function(data){
        var _ = window._;

        var series = data[0];
        var labels = data[1];
        var colours = data[2];
        var metadata = data[3];

        var target = $element[0];
        target = $('.pie-chart',target)[0];


        $scope.pieData = series;
        $scope.pieLabels = labels;
        $scope.pieColours = colours;
        if(!selection.selectedLayer.disableAnnual){
          $scope.pie.year = selection.year;
        }
        $timeout(function(){
          $(target).one('plotly_afterplot', function(){
            details.populateLabels($scope.pie,metadata);
            $scope.pie.loading=false;
          });
          Plotly.newPlot( target, [{
            labels: labels,
            values: series,
            type: 'pie',
            sort:false,
            marker:{
              colors:colours
            },
            text: series.map(function(s,i){return labels[i]+':<br> '+ details.formatValue(s) + $scope.pie.units;}),
            hoverinfo: 'text',
            textinfo: 'none',
          }], {
            height: 200,
            width: 220,
            margin: {
              l:40,
              r:10,
              b:30,
              t:10
            },
            showlegend:false
          },{
            modeBarButtonsToRemove: ['hoverCompareCartesian','hoverClosestCartesian','lasso2d','select2d'],
            displayModeBar: false,
            displaylogo: false
          });
          Plotly.relayout( target, {});
        });

        details.populateLabels($scope.pie,metadata);
        $scope.pie.sum = $scope.pieData.reduce(function(x,y){return x+y;}).toFixed();
        $scope.pie.download = downloads.downloadableTable(_.zip(labels,series),['Land Cover','Value']);
        $scope.pie.download_fn = downloads.makeDownloadFilename($scope.locationLabel(),$scope.pie.title,selection.year+'_by_landcover_classification');
        $scope.pie.loading=false;
      },$scope.clearChart);
    };

    $scope.watchList.forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.createChart);
    });

    $scope.$watch('selection.year',$scope.createChart);
  });
