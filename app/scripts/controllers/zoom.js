'use strict';

/**
 * @ngdoc function
 * @name ausEnvApp.controller:ZoomCtrl
 * @description
 * # ZoomCtrl
 * Controller of the ausEnvApp
 */
angular.module('ausEnvApp')
  .controller('ZoomCtrl', function ($scope,$uibModal,$timeout,$interpolate,
                                    selection,timeseries,configuration,
                                    downloads) {
    $scope.showPopovers={
      search:false
    };
    $scope.selection = selection;
    $scope.datasetFilename='';

    $scope.$watch('selection.selectedLayer',function(){
      if(!selection.selectedLayer){
        return;
      }
      $scope.mapDescription = selection.selectedLayer.description;
    });

    $scope.mapZoom = function(delta) {
      selection.mapCentre.zoom += delta;
    };

    $scope.showModal = function(view,ctrl){
      $scope.closeModal();
      var options = {
        animation:true,
        templateUrl: 'views/'+view+'.html',
        scope: $scope
      };

      if(ctrl){
        options.controller=ctrl;
      }


      $scope.modalInstance = $uibModal.open(options);
    };

    $scope.openShareModal = function(){
      $scope.showModal('sharing','SharingCtrl');
    };

    $scope.openSearchModal = function(){
      $scope.showPopovers.search=false;
      $scope.showModal('maptools/search');
    };

    $scope.closeModal = function(){
      if($scope.modalInstance){
        $scope.modalInstance.dismiss();
      }

      $scope.modalInstance=null;
    };

    $scope.hideSearch = function(){
      console.log('here');
      $scope.showPopovers.search='closing';
      $timeout(function(){
        if($scope.showPopovers.search==='closing'){
          $scope.showPopovers.search=false;
        }
      },500);
    };

    $scope.searchByRegion = function(){
      $scope.searchMode=0;
      $scope.openSearchModal();
    };

    $scope.searchByLatLon = function(){
      $scope.searchMode=1;
      $scope.openSearchModal();
    };

    $scope.searchByLocation = function(){
      $scope.searchMode=2;
      $scope.openSearchModal();
    };

    $scope.showTour = function(){
      $scope.selection.showHelp=true;
    };

    $scope.haveSelection = function(){
      if(selection.selectionMode==='region'){
        return selection.selectedRegion;
      }

      return selection.selectedPoint;
    };

    $scope.zoomToSelection = function(){
      if(selection.selectionMode==='region'){
        selection.zoomToFeature();
      } else {
        selection.zoomToSelectedPoint();
      }
    };

    $scope.mapSettings = function(){
      return selection.mapSettings(selection.selectedLayer);
    };

    $scope.gridDownloadURL = function(){
      var url = $scope.datasetFilename +
        $interpolate('?service=WCS&version=1.0.0&request=GetCoverage&coverage={{variable}}&format=GeoTIFF_Float&time={{time}}T00:00:00Z')($scope.mapSettings());

      url = $interpolate(url)(selection);
      return 'http://dapds00.nci.org.au/thredds/wcs/'+url;
    };

    $scope.gridDownloadFilename = function(){
      return $interpolate('grid_{{title}}_{{variable}}_{{year}}.tif')($scope.mapSettings()).replace(/ /g,"_");
    };

    var FIELDS_TO_IGNORE=['_ChunkSizes'];
    var ignore_fields = function(key){
      return FIELDS_TO_IGNORE.indexOf(key)<0;
    };

    $scope.download = function(){
      var settings = $scope.mapSettings();
      $scope.datasetFilename = $interpolate(settings.url)(selection);
      $scope.mapVariable = settings.variable;
      timeseries.retrieveMetadata($scope.datasetFilename,'das').then(function(das){
        $scope.das = das;

        $scope.metadata = {
          title:selection.selectedLayerTitle(),
          time_period:selection.mapTimePeriod()
        };
        Object.keys(das.variables[$scope.mapVariable]).filter(ignore_fields).forEach(function(attr){
          $scope.metadata[attr]=das.variables[$scope.mapVariable][attr];
        });
        Object.keys(das.attr).filter(ignore_fields).forEach(function(attr){
          $scope.metadata[attr]=das.attr[attr];
        });

        $scope.buildMetadataDownload();
      });

      $scope.downloadURL = $scope.gridDownloadURL();

      $scope.showModal('download');
    };

    $scope.buildMetadataDownload = function(){
      var keys = Object.keys($scope.metadata);
      var vals = keys.map(function(k){return $scope.metadata[k];});
      $scope.metadata_download = downloads.downloadableTable(_.zip(keys,vals),['Key','Value']);
      $scope.metadata_fn='metadata.csv';
    };
    configuration.checkDataURISupport().then(function(supported){
      $scope.dataURISupported = supported;
    });
  });
