'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:PieCtrl
 * @description
 * # PieCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('PieCtrl', function ($scope,details,downloads) {
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
      $scope.getPieData().then(function(data){
        var _ = window._;
        var series = data[0];
        var labels = data[1];
        var colours = data[2];
        var metadata = data[3];

        $scope.pieData = series;
        $scope.pieLabels = labels;
        $scope.pieColours = colours;

        details.populateLabels($scope.pie,metadata);
        $scope.pie.sum = $scope.pieData.reduce(function(x,y){return x+y;}).toFixed();
        $scope.pie.download = downloads.downloadableTable(_.zip(labels,series),['Land Cover','Value']);
        $scope.pie.download_fn = downloads.makeDownloadFilename($scope.locationLabel(),$scope.pie.title);
      },function(){
        $scope.pie = details.chartMetaData();
        $scope.pieData=[];
        $scope.pieLabels = [];
      });
    };

    $scope.watchList.forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.createChart);
    });
  });