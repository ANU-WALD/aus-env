'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:LegendCtrl
 * @description
 * # LegendCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('LegendCtrl', function ($scope,$q,selection,details,
                                      mapmodes,datamodes,colourschemes,
                                      configuration) {
    $scope.layerMetadata = configuration.metadata();

    $scope.updateMapTitles = function() {
      var result = $q.defer();
      $scope.selection = selection;
      $scope.mapTitle = null;
      $scope.mapDescription = null;
      $scope.mapUnits = null;
      $scope.mapTimePeriod = null;
      $scope.mapSuffix = null;
      if(!selection.selectedLayer) {
        result.resolve(false);
        return result.promise;
      }

      $scope.mapTimePeriod = selection.mapTimePeriod();

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

          if(!$scope.mapUnits||($scope.selection.mapMode===mapmodes.region)){
            var units = selection.selectedLayer.regionAnnualUnits||selection.selectedLayer.units||data.Units;
            $scope.mapUnits = details.unitsText(units);
          }

          if($scope.selection.dataModeConfig()==='rank'){
            $scope.mapUnits = 'return time';
          }

          var deltaMode = selection.deltaMode();
          if(deltaMode&&!selection.selectedLayer.disableAnnual){
            data = colourschemes.annualDelta(data);
          }

          if(selection.dataModeConfig()==='rank'){
            $scope.polygonDataRange = [0,10];
          } else {
            var columnName = selection.selectedLayer.summaryColumn || $scope.selection.year;
            $scope.polygonDataRange = colourschemes.dataRange(data,columnName,deltaMode);
          }

          result.resolve(true);
        });

        $scope.mapSuffix = '';

        if((selection.mapMode===mapmodes.region)&&selection.regionType){
          $scope.mapSuffix = ' by ' + selection.regionType.name;
        }

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
      // var applyLogTransform=false;
      $scope.colourScheme = [];

      if(selection.mapMode===mapmodes.grid){
        $scope.colourScaleRange = selection.selectedLayer.colorscalerange;
        if(selection.selectedLayer[selection.dataModeConfig()]) {
          $scope.colourScaleRange = selection.selectedLayer[selection.dataModeConfig()].colorscalerange || $scope.colourScaleRange;
        }
        $scope.colourScaleRange = $scope.colourScaleRange.split(',').map(function(e){return +e;});
        // $scope.applyLogTransform = false;
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
        var modeBefore = selection.dataModeConfig();
        colourschemes.coloursFor(selection.selectedLayer).then(function(data){
          var modeNow = selection.dataModeConfig();
          if(modeNow!==modeBefore){
            return;
          }

          if(modeNow==='rank'){
            $scope.makeRankColourScheme(data);
          } else {
            $scope.makeRegularColourScheme(data);
          }
        });
      }
    };

    $scope.makeRankColourScheme = function(data){
      var labels = [
        'Lowest for period',
        'Very low (10 yrs)',
        'Low (5 yrs)',
        'Average',
        'High (5 yrs)',
        'Very high (10 yrs)',
        'Highest for period'
      ];


      $scope.colourScheme = labels.map(function(lbl,i){
        return [{
          colour: data[i],
          text:lbl
        }];
      });
      $scope.colourScheme.reverse();
    };

    $scope.makeRegularColourScheme = function(data){
      var range = $scope.colourScaleRange;
      var decimalPlaces = Math.max(0,2-(+Math.log10(range[1]-range[0]).toFixed()));
      // if(applyLogTransform) {
      //   range = range.map(Math.log);
      // }
      var binSize = (range[1]-range[0])/data.length;

      var valToText = function(val,dp){
        dp = dp || decimalPlaces;
        dp = Math.min(dp,10);
        // if(applyLogTransform){
        //   val = Math.exp(val);
        // }

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
    };

    $scope.update = function(){
      $scope.updateMapTitles().then(function(success){
        if(success){
          $scope.updateColourScheme();
        } else {
          $scope.colourScheme=[];
        }
      });

      $scope.layerMetadata.then(function(metadata){
        var key = selection.selectedLayer.metadataKey || selection.selectedLayer.title;
        var meta = metadata.filter(function(record){return record.name===key;})[0];
        $scope.layerSource = meta['Data creator'].replace(',','<br/>');
        $scope.infoURL = 'http://www.ausenv.online/methods';
      });
    };

    ['year','selectedLayer','regionType','dataMode','mapMode'].forEach(function(prop){
      $scope.$watch('selection.'+prop,$scope.update);
    });
  });
