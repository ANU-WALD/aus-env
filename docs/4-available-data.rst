Summary of THREDDS data for AusEnv Project
##########################################

All data can be found in the /au/ subdirectory of our THREDDS drive.
In principle they should be largely self described, but a bit of summary below.

You can find the following data collections:


/au/treecover
=============
Landsat scale (25m) mapping of forest extent for each year as well as a file showing the change in forest area between 2013-2015.
These are large files, opening them in their entirety is not recommended and will freeze e.g. Panoply.

Functionality required: to select a year and data type (i.e. forest cover or change) and look continentally or zooming in to any area.


/au/owl/
========
Inundated area mapping for 8-day periods based on MODIS 500m, collected in annual files.
The date provided is the start date of the 8-day period.

``/au/OzWALD/owl/`` is the same data, upsampled to 0.05 degree resolution.

Functionality required: to select a date and look continentally or zooming in to any area.
I also added annual summary data for annual maximum, mean and minimum extent.
These also need to be mapped.


/au/Ramsar/
===========
This has numbered files, each of which represents a so-called "Ramsar" (i.e. ecologically important) wetland or part thereof.
The file has maximum water extent for a series of years derived from Landsat mapping, as well as layers showing the Last year pixels were inundated and dry, resp.

Functionality required: to first select a Ramsar wetland from a map with symbols, which will automatically zoom in on the geographic data extent.
Select a data type (i.e. max water extent for a particular year or the last year since.. ).


/au/OzWALD/daily/
=================
This has annual files each with a different variable at daily time step and 0.05 degree resolution.

Functionality required: select data and variable and get it visualised.
(similar to www.bom.gov.au/water/landscape/)
Among these, the data ``AWRA.daily.GPP.*`` have the highest priority.

.. note::
    I will also be generating a file with monthly and annual average values and annual average anomalies from mean.
    Similar functionality will be required.
