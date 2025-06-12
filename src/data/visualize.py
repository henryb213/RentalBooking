import geopandas as gpd
import matplotlib.pyplot as plt
from shapely.geometry import Point
import csv
import os

# Source File
postcodes_path = 'src/data/processed/postcodes/'

# Get postcodes from processed CSV
s22 = set()
s23 = set()
s24 = set()
s25 = set()

if os.path.exists(postcodes_path):
    for filename in os.listdir(postcodes_path):
        path = os.path.join(postcodes_path, filename)
        if os.path.isdir(path):
            continue
        with open(path, mode='r', newline='\n') as f:
            data = csv.reader(f)
            for i, row in enumerate(data):
                if not row[2].isnumeric():
                    print(f"No location data for postcode '{row[0]}'.")
                    continue

                p = Point(int(row[3]), int(row[2])) # Northing, Easting

                if row[1] == '22':
                    s22.add(p)
                elif row[1] == '23':
                    s23.add(p)
                elif row[1] == '24':
                    s24.add(p)
                elif row[1] == '25':
                    s25.add(p)
                else:
                    print(f"Unrecognised Mosaic subgroup: {row[1]}")
else:
    print(f"Processed postcodes directory does not exist. See 'src/data/process.py'.")

# Create Geo Data Frames
gdf_22 = gpd.GeoDataFrame(geometry=list(s22))
gdf_23 = gpd.GeoDataFrame(geometry=list(s23))
gdf_24 = gpd.GeoDataFrame(geometry=list(s24))
gdf_25 = gpd.GeoDataFrame(geometry=list(s25))

# UK Shapefile from the Office of National Statistics
uk_shapefile = 'src/data/processed/uk/uk.shp'
uk = gpd.read_file(uk_shapefile)

# Create plot
fig, ax = plt.subplots(figsize=(10, 10))

# Plot the UK map
uk.plot(ax=ax, color='white', edgecolor='black')

# Plot the points
gdf_22.plot(ax=ax, color='red', marker='o', markersize=5, label='22')
gdf_23.plot(ax=ax, color='green', marker='o', markersize=5, label='23')
gdf_24.plot(ax=ax, color="blue", marker='o', markersize=5, label='24')
gdf_25.plot(ax=ax, color="purple", marker='o', markersize=5, label='25')
# Add a title
plt.title('Postcode Points on UK Map')

ax.legend()

# Show the plot
plt.show()