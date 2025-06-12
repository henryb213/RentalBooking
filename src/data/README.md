# Mosaic Guide.

The mosaic dataset consists of 1811440 records with 5 variables.

1. Equivalent Experian 2023 Postcode
2. Flag: Experian 2023 List Postcode
3. Postcode Format 1 (Standard - 8 bytes)
4. (PC) Mosaic UK 7 Group
5. (PC) Mosaic UK 7 Type
   Variables of particular importance are the Mosiac Group & Type as well as the standard postcode.

## Access.

Never distribute the dataset. You must download and store it locally on a lab machine and not upload it to github. It should never be written to anywhere but the path: "/src/data/PC_Extract.csv". The .csv can be accessed via gitlab.

## Refine.

In the src/data/sanitise.py path is a python script written to sift through the PC_Extract.csv and select records of group F. These will be the only records we're required to analyse types for to influence our product's suggestions etc.

## Sources.

- Experian Mosaic Dataset
- Ordinance Survey Postcodes
- UK Shapefile: https://geoportal.statistics.gov.uk/search?q=BDY_CTYUA%202024&sort=Title%7Ctitle%7Casc
