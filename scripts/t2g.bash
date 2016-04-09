#!/bin/bash
#ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=5 -dialect SQLite geo/bigNatParks.json topo/bigNatParks_topo.json
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=5 -dialect SQLite geo/HR_Regions_river_region.json topo/HR_Regions_river_region_topo.json
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=4 -dialect SQLite geo/ibra7_regions.json topo/ibra7_regions_topo.json
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=5 -dialect SQLite geo/LGA11aAust.json topo/LGA11aAust_topo.json
#ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=5 -dialect SQLite geo/ramsar2015.json topo/ramsar2015_topo.json
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=4 -dialect SQLite geo/SA3_2011_AUST.json topo/SA3_2011_AUST_topo.json
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=5 -dialect SQLite geo/states4326.json topo/states4326_topo.json
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=5 -dialect SQLite geo/NRMR_2011_AUST_1.json topo/NRMR_2011_AUST_1_topo.json
echo 'done!'
