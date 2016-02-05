'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.themes
 * @description
 * # themes
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('themes', function () {
    var service = this;

    service.themes = [
      {
        name:'Tree Cover',
        url:'',
        time:'',
        layer:'',
        colorscalerange:'0,1'
      },
      {
        name:'Inundation',
        url:'http://dapds00.nci.org.au/thredds/wms/ub8/au/owl/MOD09A1.OWLau.0_005deg.2015.nc?',
        time:'2015-12-27T00:00:00.000Z',
        layer:'OWL',
        colorscalerange:'0,10'
      },
      {
        name:'Ramsar Wetlands',
        url:'http://dapds00.nci.org.au/thredds/wms/ub8/au/Ramsar/MaxWater_Ramsar072.1988-2015.nc?',
        time:'2015-12-31',
        layer:'MaxWater',
        colorscalerange:'0,10'
      },
      {
        name:'Gross Primary Productivity',
        url:'http://dapds00.nci.org.au/thredds/wms/ub8/au/OzWALD/daily/AWRA.daily.GPP.2011.nc?',
        time:'2011-12-31',
        layer:'GPP',
        colorscalerange:'0,1'
      }
    ]
  });
