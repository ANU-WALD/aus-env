'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:PieCtrl
 * @description
 * # PieCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('PieCtrl', function ($scope,details,downloads,selection) {
    $scope.pie = details.chartMetaData();
    $scope.pie.sum=null;
    $scope.pieData = [];
    $scope.pieLabels = [];

    $scope.pieChartOptions = {
      animateRotate: false,
      animationSteps: 1,
      tooltipTemplate: details.tooltipTextFunction($scope.pie)
    };

    $scope.createChart = function(){
      $scope.pie.loading=true;
      $scope.pie.year = ''

      if(selection.selectedLayer.disablePie){
        $scope.chartView('pie',false);
        $scope.pie = details.chartMetaData();
        $scope.pieData=[];
        $scope.pieLabels = [];
        $scope.pie.loading=false;
        return;
      }

      $scope.getPieData().then(function(data){
        var _ = window._;
        var series = data[0];
        var labels = data[1];
        var colours = data[2];
        var metadata = data[3];

        $scope.pieData = series;
        $scope.pieLabels = labels;
        $scope.pieColours = colours;
        if(!selection.selectedLayer.disableAnnual){
          $scope.pie.year = selection.year;
        }

        details.populateLabels($scope.pie,metadata);
        $scope.pie.sum = $scope.pieData.reduce(function(x,y){return x+y;}).toFixed();
        $scope.pie.download = downloads.downloadableTable(_.zip(labels,series),['Land Cover','Value']);
        $scope.pie.download_fn = downloads.makeDownloadFilename($scope.locationLabel(),$scope.pie.title,selection.year+'_by_landcover_classification');
        $scope.pie.loading=false;
      },function(){
        $scope.pie = details.chartMetaData();
        $scope.pieData=[];
        $scope.pieLabels = [];
        $scope.pie.loading=false;
      });
    };

    $scope.watchList.forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.createChart);
    });

    $scope.$watch('selection.year',$scope.createChart);
  });
