#!/usr/bin/python3

"""
wenfo.wald.org for the aus-env project

an example of an attempt to fix broken/invalid polygons in the features of a shapefile.
note this will modify the specified shapefile *in place* so copy the original and act on the copy!
not advisable to use this blindly, but may help remember things in case of future need.
"""

from osgeo import ogr
import shapely.wkt

modname=r'sacrificial/NRMR_2011_AUST_1.shp'

ogr.UseExceptions()

def main(modname):
    modfile=ogr.Open(modname,1)

    outlayer=modfile.GetLayer(0)

    n = 1
    for feat in outlayer:
        outlayer.SetFeature(feat)
        geom = feat.GetGeometryRef()
        wkt = geom.ExportToWkt()
        sg = shapely.wkt.loads(wkt)
        print(sg.is_valid,feat.GetField("NRMR_NAME"),feat.GetField("SQKM"))
        if sg.is_valid:
            pass
        else:
            sg.buffer(0)
        n += 1
    
    del modfile

main(modname)

print('done')

