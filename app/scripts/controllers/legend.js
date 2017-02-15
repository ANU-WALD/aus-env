'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:LegendCtrl
 * @description
 * # LegendCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('LegendCtrl', function ($scope,$q,selection,details,mapmodes,datamodes,colourschemes) {
    $scope.updateMapTitles = function() {
      var result = $q.defer();
      $scope.selection = selection;
      $scope.mapTitle = null;
      $scope.mapDescription = null;
      $scope.mapUnits = null;
      $scope.mapTimePeriod = null;

      if(!selection.selectedLayer) {
        result.resolve(false);
        return result.promise;
      }

      if(selection.selectedLayer.delta && (selection.dataMode===datamodes.delta)){
        $scope.mapTimePeriod = +(selection.year-1) + ' to ' + selection.year;
      } else {
        $scope.mapTimePeriod = +selection.year;
      }

      $scope.mapTitle = selection.selectedLayerTitle();
      $scope.mapDescription = selection.selectedLayer.description;
      $scope.mapUnits = selection.selectedLayer.units;

      if(selection.selectedLayer.disablePolygons) {
        result.resolve(true);
      } else {
        details.getPolygonFillData().then(function(data){
          if(!data){
            result.resolve(false);
            return;
          }
          if($scope.selection.mapMode===mapmodes.region) {
            $scope.mapTitle = selection.selectedLayerTitle(data.Title);
          }
          $scope.mapDescription = $scope.mapDescription || data.Description;
          $scope.mapUnits = $scope.mapUnits || details.unitsText(data.Units);

          var deltaMode = (selection.dataMode===datamodes.delta)&&selection.selectedLayer.delta;
          if(deltaMode) {
            data = colourschemes.annualDelta(data);
          }
          $scope.polygonDataRange = colourschemes.dataRange(data,$scope.selection.year,deltaMode);

          result.resolve(true);
        });
      }

      return result.promise;
    };

    $scope.balanceColourScheme = function(entries) {
      if(entries.length>10) {
        var secondaryColumn = entries.splice(entries.length/2);
        for(var i=0;i<entries.length;i++){
          entries[i].push(secondaryColumn.shift()[0]);
        }
        if(secondaryColumn.length){
          secondaryColumn[0].unshift({});
          entries.push(secondaryColumn[0]);
        }
      }

      return entries;
    };


    $scope.updateColourScheme = function() {
      // +++TODO need to compute applyLogTransform
      var applyLogTransform=false;
      $scope.colourScheme = [];

      if(selection.mapMode===mapmodes.grid){
        $scope.colourScaleRange = selection.selectedLayer.colorscalerange;
        if(selection.selectedLayer[selection.dataModeConfig()]) {
          $scope.colourScaleRange = selection.selectedLayer[selection.dataModeConfig()].colorscalerange || $scope.colourScaleRange;
        }
        $scope.colourScaleRange = $scope.colourScaleRange.split(',').map(function(e){return +e;});
        $scope.applyLogTransform = false;
      } else {
        $scope.colourScaleRange = $scope.polygonDataRange;
      }

      var customLegend = selection.selectedLayer.legend;
      var mm = selection.mapMode.toLowerCase();
      if(customLegend&&customLegend[mm]!==undefined){
        customLegend=customLegend[mm];
      }

      if(customLegend) {
        // +++ NASTY HACK TO GET DLCD CODES
        details[customLegend]().then(function(colourCodes){
          $scope.colourScheme = [];
          for(var key in colourCodes) {
            var e = colourCodes[key];
            $scope.colourScheme.push([
            {
              colour: 'rgb('+e.Red+','+e.Green+','+e.Blue+')',
              text:e.Class_Name
            }]);
          }
          $scope.colourScheme = $scope.balanceColourScheme($scope.colourScheme);
        });
      } else {
        colourschemes.coloursFor(selection.selectedLayer).then(function(data){
          var range = $scope.colourScaleRange;
          var decimalPlaces = Math.max(0,2-(+Math.log10(range[1]-range[0]).toFixed()));
          if(applyLogTransform) {
            range = range.map(Math.log);
          }
          var binSize = (range[1]-range[0])/data.length;

          var valToText = function(val,dp){
            dp = dp || decimalPlaces;
            dp = Math.min(dp,10);
            if(applyLogTransform){
              val = Math.exp(val);
            }

            return details.formatValue(val,dp);
          };

          var distinctText = function(val,lowerText){
            var valText;
            var dp = decimalPlaces;
            do{
              valText = valToText(val,dp);
              dp++;
            }while((+lowerText>=+valText)&&(dp<=10));

            return valText;
          };

          var lowerText = valToText(range[0]);
          $scope.colourScheme = data.slice().map(function(e,idx){
            var upperText = distinctText(range[0]+((idx+1)*binSize),lowerText);
            var label = lowerText + ' - ' + upperText;
            lowerText = upperText;
            return [{
              colour: e,
              text: label
            }];
          });
          $scope.colourScheme[data.length-1][0].text = '&ge;'+valToText(range[1]-binSize);
          $scope.colourScheme.reverse();
          $scope.colourScheme = $scope.balanceColourScheme($scope.colourScheme);
        });
      }
    };

    $scope.update = function(){
      $scope.updateMapTitles().then(function(success){
        if(success){
          $scope.updateColourScheme();
        } else {
          $scope.colourScheme=[];
        }
      });
    };

    ['year','selectedLayer','regionType','dataMode','mapMode'].forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.update);
    });
  });
