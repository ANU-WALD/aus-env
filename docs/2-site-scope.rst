Scoping the Aus-Env website
###########################
Australia's Environment in 2015


Background
==========
In March/April (probably latter) of 2015, Albert and some of his group intend to give a seminar (series) presenting their best assessment of the condition of Australia's Environment in 2015.
This would be a good opportunity to focus some web development.

The document outlining a ToC for the seminar can be found elsewhere in this folder.
Essentially, it will seek to summarise the main changes in the environment in terms of:

#. land use / land cover change
#. bushfire
#. weather and water
#. rivers and wetlands
#. agricultural land
#. natural ecosystems
#. the carbon balance

For each of this themes, one or a few national-scale headline indicators will be calculated to express the main environmental changes in 2015.
Examples could be, e.g., (a) the amount of natural forest lost or gained; (b) the number of wetlands receiving above average water; etc.
Specific indicators will be determined at a later stage based on the type and quality of data available and the meaningfulness and robustness of the interpretation.
Some relevant examples could be Australia's `Sustainability Indicators`_ or the `trial environmental accounts`_ by the Wentworth Group.

.. _Sustainability Indicators: https://www.environment.gov.au/topics/sustainable-communities/measuring-sustainability/sustainability-indicators
.. _trial environmental accounts: http://wentworthgroup.org/portfolio-item/native-vegetation/

Underpinning these indicators will be spatio-temporal data summarised in tabulated environmental accounts, in which the spatial and temporal data are aggregated to suitable

-  temporal scales (probably mainly annual)
-  spatial units - probably by statistical area, bioregion, catchment and environmental asset (e.g. national park, Ramsar site)
-  spatial subunits (e.g. land cover/use categories)


Web delivery
============
We envisage a data exploration web site, where people having heard the seminar or its summary can go and explore the interpreted data for themselves. For example, they:

-  may be particularly interested in a particular region or location, and want to see some mapping or tabulated numbers for it
-  may wish to take their time and explore national mapping of particular variables (e.g. land cover change, flooding, etc)
-  Investigate how certain headline indicators were calculated, i.e., on the basis of what data or by what method.
-  May wish to download a data layer or table for further analysis or comparison.


Possible site structure
=======================
A promising web site structure could be to have a landing page with a set of headline indicators that summarise 2015 at a glance. This could involve up/down arrows with simple stats next to them, for example, or other infographics-type visualisations. There could be a clickable national map that allows headline indicators to be shown by region.

At this level, one might:

a) click one of the headline indicators shown, which would take you to a theme page (e.g., natural ecosystems, or fire) where you can browse through a small number of national maps of different variables.

b) click on one of the regions (SLAs, catchments, bioregions, assets etc.) or search for it in a list, and be shown the headline indicators for that region. This could then allow you to click through to get the detail on those headline indicators for that region (i.e. a similar map as (a) but zooming in on that region).


Components required
===================
These are likely to include:

#.  Grid mapping (WMS, DAP)
#.  Displaying headline indicators (with some type of simple visualisation)
#.  Presenting tabular data

  #.  as maps
  #.  as tables

#.  graphing (in a panel or as popups) showing

  #.  time series
  #.  bar chart
  #.  pie chart


Data sources
============
Likely to include the following:

-  OzWALD model-data system input and output files (0.05 degree daily).
-  Tree cover (change) mapping (1/4000 degree, one map for 2015)
-  Inundation mapping (0.005 degree, 8-daily maps)

In each of these cases, we can produce 2015 summary maps (mean, min, max, anomaly, etc) as required.
