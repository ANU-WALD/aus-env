#!/usr/bin/python3

"""
wenfo.wald.org for the aus-env project

a script to add sequential numeric IDs to each of the features of a shapefile.
note this will modify the specified shapefile *in place*
so copy the original and act on the copy!
"""

from osgeo import ogr

#modname='/home/ambrose/Documents/WALD/working/vectors/derived/CAPAD_2014_terrestrial_wid_wgs.shp'
modname=r'derived/CAPAD_2014_terrestrial_wid_wgs.shp'

ogr.UseExceptions()

def main(modname):
    modfile=ogr.Open(modname,1)

    outlayer=modfile.GetLayer(0)

    outlayer.CreateField(ogr.FieldDefn('wenfo_ID', ogr.OFTInteger))
    n = 1
    for feat in outlayer:
        feat.SetField('wenfo_ID', n)
        outlayer.SetFeature(feat)
        n += 1
    
    del modfile

main(modname)

print('done')

