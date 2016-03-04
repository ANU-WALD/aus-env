#export PATH='~/node_modules/.bin:'+$PATH #for topojson
##example compressed
##ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=2 -simplify 0.05 -dialect SQLite -select SUB_CODE_7,SUB_CODE_7,REG_CODE_7,REG_NAME_7 ramsar/ibra7_subresions.json originals/ShapeFiles/ibra7_subresions.shp
##example 'straight'
##ogr2ogr -f GeoJSON -dialect SQLite ramsar/orig_ibra7_subresions.json originals/ShapeFiles/ibra7_subresions.shp
##getting metadata to strip
#echo $PATH
#echo '=============================METADATA==========================================='
#echo '========================================================================'
# CAPAD subset with just 'National Park', 'National Park (Commonwealth)' and 'National Park Aboriginal'
# and with features with 'GIS AREA' greater than 5000.
echo '========================================================================'
ogrinfo derived/NatParks_wid/NatParks_wid.shp NatParks_wid | head -n 64
echo '========================================================================'
# BoM states data in latlong
ogrinfo derived/states4326/states4326.shp states4326 | head -n 18
echo '========================================================================'
ogrinfo derived/CAPAD_2014_terrestrial_wid_wgs/CAPAD_2014_terrestrial_wid_wgs.shp CAPAD_2014_terrestrial_wid_wgs | head -n 64
echo '========================================================================'
ogrinfo originals/ShapeFiles/HR_Regions_river_region.shp HR_Regions_river_region | head -n 52
#echo '========================================================================'
#ogrinfo originals/ShapeFiles/ibra7_subresions.shp ibra7_subresions | head -n 50
echo '========================================================================'
ogrinfo originals/ShapeFiles/NRMR_2011_AUST_1.shp NRMR_2011_AUST_1 | head -n 20
echo '========================================================================'
ogrinfo originals/ShapeFiles/ramsar2015.shp ramsar2015 | head -n 44
echo '========================================================================'
ogrinfo originals/ShapeFiles/LGA11aAust.shp LGA11aAust | head -n 20
echo '========================================================================'
ogrinfo originals/ShapeFiles/SA3_2011_AUST.shp SA3_2011_AUST | head -n 24
echo '========================================================================'
ogrinfo originals/ShapeFiles/ibra7_regions.shp ibra7_regions | head -n 36
echo '========================================================================'
#echo '===========================BIG GEO JSONS============================================='
#echo '================================CAPAD========================================'
#ogr2ogr -f GeoJSON -dialect SQLite json/big/big_CAPAD_2014_terrestrial_wgs.json originals/ShapeFiles/CAPAD_2014_terrestrial_wgs.shp
#echo '=================================HR REGIONS RIVER REGION======================================='
#ogr2ogr -f GeoJSON -dialect SQLite json/big/big_HR_Regions_river_region.json originals/ShapeFiles/HR_Regions_river_region.shp
#echo '===================================IBRA SUBREGIONS====================================='
#ogr2ogr -f GeoJSON -dialect SQLite json/big/big_ibra7_subresions.json originals/ShapeFiles/ibra7_subresions.shp
#echo '=======================================NRMR 2011================================='
#ogr2ogr -f GeoJSON -dialect SQLite json/big/big_NRMR_2011_AUST.json originals/ShapeFiles/NRMR_2011_AUST.shp
#echo '=======================================RAMSAR 2015================================='
#ogr2ogr -f GeoJSON -dialect SQLite json/big/big_ramsar2015.json originals/ShapeFiles/ramsar2015.shp
#echo '====================================SA1 2011===================================='
#ogr2ogr -f GeoJSON -dialect SQLite json/big/big_SA1_2011_AUST.json originals/ShapeFiles/SA1_2011_AUST.shp
#
#
#
#
echo '==========================SMALL GEO JSONS=============================================='
# ##### CAPAD AND NATPARKS  CAN WAIT UNTIL TINY POLYGONS ARE STRIPPED FROM THE DERIVED SHAPEFILE
echo '=========================STATES==============================================='
#
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=3 -simplify 0.02 -dialect SQLite -select STATE_CODE,STATE_NAME json/small/states4326.json derived/states4326/states4326.shp
#
#ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=2 -simplify 0.05 -dialect SQLite -select PA_ID,NAME,TYPE json/small/small_NatParks.json originals/ShapeFiles/NatParks.shp
echo '=================================NAT PARKS EXCEPT MINISCULE====================================='
#
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=2 -simplify 0.05 -dialect SQLite -select wenfo_ID,NAME json/small/NatParks.json derived/NP_GT_5K/NP_GT_5K.shp
#
#ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=2 -simplify 0.25 -dialect SQLite -select PA_ID,NAME json/small/small_CAPAD_2014_terrestrial_wgs.json originals/ShapeFiles/CAPAD_2014_terrestrial_wgs.shp
echo '=========================HR REGIONS==============================================='
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=3 -simplify 0.05 -dialect SQLite -select OBJECTID,RivRegName json/small/HR_Regions_river_region.json originals/ShapeFiles/HR_Regions_river_region.shp
echo '================IBRA========================================================'
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=2 -simplify 0.08 -dialect SQLite -select REC_ID,REG_NAME_7 json/small/ibra7_regions.json originals/ShapeFiles/ibra7_regions.shp
echo '====================NRMR===================================================='
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=3 -simplify 0.05 -dialect SQLite -select NRMR_CODE,NRMR_NAME json/small/NRMR_2011_AUST_1.json originals/ShapeFiles/NRMR_2011_AUST_1.shp
echo '========================RAMSAR================================================'
#ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=3 -simplify 0.05 -dialect SQLite -select OBJECTID,RAMSAR_NAM,WETLAND_NA json/small/ramsar2015.json originals/ShapeFiles/ramsar2015.shp
echo '==============================SA 2011=========================================='
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=3 -simplify 0.05 -dialect SQLite -select SA3_CODE,SA3_NAME json/small/SA3_2011_AUST.json originals/ShapeFiles/SA3_2011_AUST.shp
#
#
#
#
echo '=====================================TOPO JSON SMALL==================================='
#echo '==============================CAPAD=========================================='
#topojson --simplify-proportion 0.00005 --quantization 1e3 --properties PA_ID,NAME -o json/smalltopo/s_topo_CAPAD_2014_terrestrial_wgs.json originals/ShapeFiles/CAPAD_2014_terrestrial_wgs.shp
echo '===================================STATES (todo)====================================='
echo '===================================HR REGIONS====================================='
#topojson --simplify-proportion 0.1 --quantization 1e6 --properties HydroID,RivRegName -o json/smalltopo/s_topo_HR_Regions_river_region.json originals/ShapeFiles/HR_Regions_river_region.shp
echo '===================================IBRA====================================='
#topojson --simplify-proportion 0.01 --quantization 1e5 --properties SUB_NAME_7,REG_NAME_7 -o json/smalltopo/s_topo_ibra7_subresions.json originals/ShapeFiles/ibra7_subresions.shp
echo '=======================================NRMR================================='
#topojson --simplify-proportion 0.1 --quantization 1e6 --properties NRMR_CODE,NRMR_NAME -o json/smalltopo/s_topo_NRMR_2011_AUST.json originals/ShapeFiles/NRMR_2011_AUST.shp
#echo '===========================================RAMSAR============================='
#topojson --simplify-proportion 0.1 --quantization 1e6 --properties RAMSAR_NAM,WETLAND_NA -o json/smalltopo/s_topo_ramsar2015.json originals/ShapeFiles/ramsar2015.shp
echo '=================================================SA3======================='
#topojson --simplify-proportion 0.1 --quantization 1e6 --properties ??????  -o json/smalltopo/s_topo_SA1_2011_AUST.json originals/ShapeFiles/SA1_2011_AUST.shp
#echo '================TOPO JSON LARGE========================================================'
#echo '============================CAPAD============================================'
#topojson --properties-o json/bigtopo/topo_CAPAD_2014_terrestrial_wgs.json originals/ShapeFiles/CAPAD_2014_terrestrial_wgs.shp
#echo '===============================HR========================================='
#topojson --properties -o json/bigtopo/topo_HR_Regions_river_region originals/ShapeFiles/HR_Regions_river_region.shp
#echo '=================================IBRA======================================='
#topojson --properties -o json/bigtopo/topo_ibra7_subresions.json originals/ShapeFiles/ibra7_subresions.shp
#echo '=====================================NRMR==================================='
#topojson --properties -o json/bigtopo/topo_NRMR_2011_AUST.json originals/ShapeFiles/NRMR_2011_AUST.shp
#echo '=========================================RAMSAR==============================='
#topojson --properties -o json/bigtopo/topo_ramsar2015.json originals/ShapeFiles/ramsar2015.shp
#echo '===========================================SA============================='
##topojson --properties -o json/bigtopo/topo_SA1_2011_AUST.json originals/ShapeFiles/SA1_2011_AUST.shp
echo '==================================MANY ERRORS: COVERT TOPO 2 GEO VIA PY OR http://converter.mygeodata.eu/ OR that other one, or best of all locally =========='
echo '=====================================DONE==================================='





