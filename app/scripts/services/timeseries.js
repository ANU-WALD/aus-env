'use strict';

/**
 * @ngdoc service
 * @name ausEnvApp.timeseries
 * @description
 * # timeseries
 * Service in the ausEnvApp.
 */
angular.module('ausEnvApp')
  .service('timeseries', function ($window,$q,$http,$interpolate,details/*,selection*/) {
    var service = this;
    var dap = $window.dap;
    // var BASE_URL='https://proxies.hydrograph.io/nci-cors/thredds/dodsC/';
    var BASE_URL='https://thredds.nci.org.au/thredds/dodsC/';

    service.cache = {
      das:{},
      ddx:{}
    };

    service.retrieveMetadata = function(fn,meta){
      if(!service.cache[meta][fn]){
        var result = $q.defer();
        var url = BASE_URL+fn+'.'+meta;
        $http.get(url).then(function(resp){
          var parsed = dap['parse'+meta.toUpperCase()](resp.data);
          result.resolve(parsed);
        });
        service.cache[meta][fn] = result.promise;
      }

      return service.cache[meta][fn];
    };

    service.dimensions = {
      time:{},
      latitude:{},
      longitude:{},
      ID:{}
    };

    service.retrieveDimension = function(fn,dim){
      if(!service.dimensions[dim][fn]){
        var result = $q.defer();
        var url = BASE_URL+fn+'.ascii?'+dim;
        $q.all([$http.get(url),service.retrieveMetadata(fn,'ddx')]).then(function(respAndDAS){
          var data = respAndDAS[0].data;
          var ddx = respAndDAS[1];
          var parsed = dap.parseData(data,ddx);
          result.resolve(parsed);
        });
        service.dimensions[dim][fn] = result.promise;
      }

      return service.dimensions[dim][fn];
    };

    service.retrieveAnnualForPoint = function(pt,layer){
      return service.retrieveTimeSeriesForPoint(pt,layer);
    };


    service.retrieveTimeSeriesForPoint = function(pt,layer,year){
      var result = $q.defer();
      var url = $interpolate(layer.url)({year:year});

      $q.all(['das','ddx'].map(function(m){return service.retrieveMetadata(url,m);}))
        .then(function(allMeta){
          var ddx = allMeta[1];
          var variableMetadata = ddx.variables[layer.variable];
          var dimensionOrder = variableMetadata.dimensions.map(function(dim){return dim.name;});
          $q.all(['time','longitude','latitude'].map(function(dim){
            return service.retrieveDimension(url,dim);
          })).then(function(dimensions){
            var t = dimensions[0].time;
            var lng = dimensions[1].longitude;
            var lngIndex = service.indexInDimension(pt.lng(),lng);

            var lat = dimensions[2].latitude;
            var latIndex = service.indexInDimension(pt.lat(),lat,true);

            // http://dapds00.nci.org.au/thredds/dodsC/ub8/au/treecover/250m/ANUWALD.TreeCover.AllYears.250m.nc.ascii?AllYears[0:1:22][1746:1:1746][9042:1:9042]
            var query = BASE_URL+url+'.ascii?';
            query += layer.variable;
            dimensionOrder.forEach(function(dim){
              switch(dim.toLowerCase()){
                case 'time':
                  query += service.dapRangeQuery(0,t.length-1);
                  break;
                case 'latitude':
                  query += service.dapRangeQuery(latIndex);
                  break;
                case 'longitude':
                  query += service.dapRangeQuery(lngIndex);
                  break;
              }
            });
            $http.get(query).then(function(resp){
              var _fills;
              if(layer._FillValue){
                _fills={};
                _fills[layer.variable]=layer._FillValue;
              } else if (ddx&&ddx.variables){
                _fills = {};
                Object.keys(ddx.variables).forEach(function(v){
                  var fv = +ddx.variables[v]._FillValue;
                  if((fv<0)&&(ddx.variables[v].dType||'').startsWith('UInt')){
                    var width = +ddx.variables[v].dType.slice(4);
                    var max = Math.pow(2,width);
                    fv = max + fv;
                  }
                  _fills[v] = fv;
                });
              }
              var data = dap.simplify(dap.parseData(resp.data,ddx,_fills));
              if(layer.scale){
                data[layer.variable] = data[layer.variable].map(function(v){return v * layer.scale;});
              }
              result.resolve(data);
            },function(){
              result.reject();
            });
          },function(){
            result.reject();
          });
      },function(){
        result.reject();
      });

      return result.promise;
    };

    service.retrieveTimeSeriesForPolygon =function(id,layer,year){
      var result = $q.defer();
      id = +id;

      var url = $interpolate(layer.url)({year:year,source:details.polygonSource()});

      $q.all(['das','ddx'].map(function(m){return service.retrieveMetadata(url,m);}))
        .then(function(allMeta){
          var ddx = allMeta[1];
          $q.all(['time','ID'].map(function(dim){
            return service.retrieveDimension(url,dim);
          })).then(function(dimensions){
            var t = dimensions[0].time;
            var idDimension = dimensions[1].ID;
            var idIndex;

            if(id===9999){
              idIndex = idDimension.length-1;
            }else{
              idIndex = service.indexInDimension(id,idDimension,false,1);
            }
            // http://dapds00.nci.org.au/thredds/dodsC/ub8/au/treecover/250m/ANUWALD.TreeCover.AllYears.250m.nc.ascii?AllYears[0:1:22][1746:1:1746][9042:1:9042]
            var query = BASE_URL+url+'.ascii?';
            query += layer.variable;
            query += service.dapRangeQuery(0,t.length-1);
            query += service.dapRangeQuery(idIndex);
            $http.get(query).then(function(resp){
              var data = dap.simplify(dap.parseData(resp.data,ddx));
              if(layer.scale){
                data[layer.variable] = data[layer.variable].map(function(v){return v * layer.scale;});
              }
              result.resolve(data);
            });
          });
      });

      return result.promise;

    };

    service.dapRangeQuery = function(from,to,step){
      step = step || 1;
      if(to===undefined){
        to = from;
      }
      return '['+from+':'+step+':'+to+']';
    };

    service.retrieveForPoint = function(/*pt,layer*/){

    };

    service.indexInDimension = function(c,dim,rev,trim){
      var minIndex = 0;
      var maxIndex = dim.length-1;

      if(trim){
        maxIndex-=trim;
      }

      if(rev){
        minIndex = maxIndex;
        maxIndex = 0;
      }
      var currentIndex;

      while((minIndex<=maxIndex)||(rev&&(maxIndex<=minIndex))){
        if(c<=dim[minIndex]){
          return minIndex;
        }

        if(c>=dim[maxIndex]){
          return maxIndex;
        }

        currentIndex = Math.floor((minIndex + maxIndex) / 2);

        var d1 = Math.abs(dim[currentIndex]-c);
        var d2 = Math.abs(dim[currentIndex+1]-c);

        if(rev){
          if (d2 <= d1) {
              maxIndex = currentIndex + 1;
          } else {
              minIndex = currentIndex;
          }
        } else {
          if (d2 <= d1) {
              minIndex = currentIndex + 1;
          } else {
              maxIndex = currentIndex;
          }
        }
      }
      return currentIndex;
    };
  });
