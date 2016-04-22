export PATH='~/node_modules/.bin:'+$PATH #for topojson
##example compressed
##ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=2 -simplify 0.05 -dialect SQLite -select SUB_CODE_7,SUB_CODE_7,REG_CODE_7,REG_NAME_7 ramsar/ibra7_subresions.json originals/ShapeFiles/ibra7_subresions.shp
##example 'straight'
##ogr2ogr -f GeoJSON -dialect SQLite ramsar/orig_ibra7_subresions.json originals/ShapeFiles/ibra7_subresions.shp
##getting metadata to strip
#echo $PATH
echo '=============================METADATA==========================================='
#echo '========================================================================'
# CAPAD subset with just 'National Park', 'National Park (Commonwealth)' and 'National Park Aboriginal'
# and with features with 'GIS AREA' greater than 5000 (Hectares).
echo '========================================================================'
ogrinfo ../derived/NatParks_wid/NatParks_wid.shp NatParks_wid | head -n 64
echo '========================================================================'
# BoM states data in latlong
ogrinfo ../derived/states4326/states4326.shp states4326 | head -n 18
echo '========================================================================'
ogrinfo ../derived/CAPAD_2014_terrestrial_wid_wgs/CAPAD_2014_terrestrial_wid_wgs.shp CAPAD_2014_terrestrial_wid_wgs | head -n 64
echo '========================================================================'
ogrinfo ../originals/ShapeFiles/HR_Regions_river_region.shp HR_Regions_river_region | head -n 52
echo '========================================================================'
ogrinfo sacrificial/NRMR_2011_AUST_1.shp NRMR_2011_AUST_1 | head -n 20
echo '========================================================================'
ogrinfo ../originals/ShapeFiles/ramsar2015.shp ramsar2015 | head -n 44
echo '========================================================================'
ogrinfo sacrificial/LGA11aAust.shp LGA11aAust | head -n 20
echo '========================================================================'
ogrinfo ../originals/ShapeFiles/SA3_2011_AUST.shp SA3_2011_AUST | head -n 24
echo '========================================================================'
ogrinfo ../originals/ShapeFiles/ibra7_regions.shp ibra7_regions | head -n 36
echo '========================================================================'
#
#
#
#
echo '==========================SMALL GEO JSONS=============================================='
echo '=================================NAT PARKS EXCEPT MINISCULE====================================='
#
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=3 -simplify 0.025 -dialect SQLite -select wenfo_ID,NAME ../json/small/NatParks.json ../derived/NP_GT_5K/NP_GT_5K.shp
#
#ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=2 -simplify 0.25 -dialect SQLite -select PA_ID,NAME json/small/small_CAPAD_2014_terrestrial_wgs.json originals/ShapeFiles/CAPAD_2014_terrestrial_wgs.shp
#echo '=========================HR REGIONS==============================================='
#ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=3 -simplify 0.05 -dialect SQLite -select OBJECTID,RivRegName json/small/HR_Regions_river_region.json originals/ShapeFiles/HR_Regions_river_region.shp
#echo '================IBRA========================================================'
#ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=2 -simplify 0.08 -dialect SQLite -select REC_ID,REG_NAME_7 json/small/ibra7_regions.json originals/ShapeFiles/ibra7_regions.shp
#echo '====================LGA==================================================='
#ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=3 -simplify 0.05 -dialect SQLite -select LGA_CODE11,LGA_NAME11 LGA11aAust.json sacrifical/LGA11aAust.shp
#echo '====================NRMR===================================================='
#ogr2ogr -f GeoJSON -dialect SQLite -select NRMR_CODE,NRMR_NAME json/small/NRMR_2011_AUST_1.json sacrificial/ShapeFiles/NRMR_2011_AUST_1.shp
echo '========================RAMSAR================================================'
ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=4 -simplify 0.005 -dialect SQLite -select OBJECTID,RAMSAR_NAM,WETLAND_NA ../json/small/ramsar2015.json ../originals/ShapeFiles/ramsar2015.shp
#echo '==============================SA 2011=========================================='
#ogr2ogr -f GeoJSON -lco COORDINATE_PRECISION=3 -simplify 0.05 -dialect SQLite -select SA3_CODE,SA3_NAME json/small/SA3_2011_AUST.json originals/ShapeFiles/SA3_2011_AUST.shp
#
#
#
echo '=====================================TOPO JSON SMALL==================================='
#echo '==============================CAPAD=========================================='
#topojson --simplify-proportion 0.00005 --quantization 1e3 --properties PA_ID,NAME -o json/smalltopo/s_topo_CAPAD_2014_terrestrial_wgs.json originals/ShapeFiles/CAPAD_2014_terrestrial_wgs.shp
#echo '==============================NATPARKS=========================================='
#topojson --simplify-proportion 0.001 --quantization 1e4 --properties PA_ID,NAME -o ../json/smalltopo/bigNatParks_topo.json ../derived/NP_GT_5K/NP_GT_5K.shp
echo '===================================STATES (todo)====================================='
topojson --simplify-proportion 0.25 --quantization 1e4 --properties STATE_CODE,STATE_NAME -o ../json/smalltopo/states4326_topo.json ../derived/states4326/states4326.shp
echo '===================================HR REGIONS====================================='
topojson --simplify-proportion 0.1 --quantization 1e4 --properties OBJECTID,RivRegName -o ../json/smalltopo/HR_Regions_river_region_topo.json ../originals/ShapeFiles/HR_Regions_river_region.shp
echo '===================================IBRA====================================='
topojson --simplify-proportion 0.47 --quantization 2.6e3 --properties REC_ID,REG_NAME_7 -o ../json/smalltopo/ibra7_regions_topo.json ../originals/ShapeFiles/ibra7_regions.shp
echo '======================================LGA================================='
topojson --simplify-proportion 0.3 --quantization 5e3 --properties LGA_CODE11,LGA_NAME11 -o ../json/smalltopo/LGA11aAust_topo.json sacrificial/LGA11aAust.shp
echo '=======================================NRMR================================='
topojson --simplify-proportion 0.25 --quantization 6e3 --properties NRMR_CODE,NRMR_NAME -o ../json/smalltopo/NRMR_2011_AUST_1_topo.json sacrificial/NRMR_2011_AUST_1.shp
#echo '===========================================RAMSAR============================='
#topojson --simplify-proportion 0.001 --quantization 1e5 --properties OBJECTID,RAMSAR_NAM,WETLAND_NA -o ../json/smalltopo/ramsar2015_topo.json ../originals/ShapeFiles/ramsar2015.shp
echo '=================================================SA3======================='
topojson --simplify-proportion 0.2 --quantization 1e4 --properties SA3_CODE,SA3_NAME -o ../json/smalltopo/SA3_2011_AUST_topo.json ../originals/ShapeFiles/SA3_2011_AUST.shp
echo '=====================================DONE==================================='


###### FOR THE MOST PART THIS CONTAINS THE PARAMS TO REDUCE / SIMPLIFY .SHP DOWN TO TOPOJSON....
###### BECAUSE THE UP-TO-DATE GDAL/OGR NECESSARY TO CONVERT BACK TO PLAIN OLD GEOJSON IS ON
###### ANOTHER (VIRTUAL) MACHINE, IT IS INVOKED BY ANOTHER SCRIPT (T2G.BASH)


