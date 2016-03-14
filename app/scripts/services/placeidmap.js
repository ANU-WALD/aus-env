'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.placeidmap
 * @description
 * # placeidmap
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('placeidmap', function ($q,$http) {
    var service = this;
  	service.createThePlaceDictionary = function(the_summary, the_source){
  		var result = $q.defer();

  		var geojsonURL = 'static/selection_layers/'+the_source+'.json';
      var httpGeojsonURL = $http.get(geojsonURL);

      var jsonIdNameMap = new Map();

      httpGeojsonURL.then(function(json_resp){
        console.log("CREATE THE Dictionary");
        var related_json = json_resp.data;
        var json_features = related_json.features;
        json_features.forEach(function(feature) {
          //console.log(feature.properties);
          jsonIdNameMap.set(feature.properties.OBJECTID, feature.properties.RivRegName);
        });
      });
  	};
  });
