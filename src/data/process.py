import csv
import os

input = "src/data/mosaic/PC_Extract.csv"
output_dir = "src/data/processed/postcodes"

with open(input, mode="r", newline="\n") as raw:
    large_dataset = csv.reader(raw)
    subset = None
    subset_file = None

    last_prefix = None
    current_prefix = None
    postcode_file = None
    postcode_reader = None
    omitted = []
    processed_postcodes = set()

    for i, row in enumerate(large_dataset, start=1):
        if len(row) > 2 and row[3] == "F":
            refined_row = [row[0].replace(" ", ""), row[4]]  # POSTCODE, MOSAIC_SUBGROUP

            # Get new postcode prefix
            current_prefix = refined_row[0][:2].lower()
            if current_prefix[1].isnumeric():
                current_prefix = current_prefix[0]

            # Check if new prefix is different from last prefix
            if (
                current_prefix != last_prefix
                and current_prefix not in omitted
                and current_prefix
            ):
                processed_postcodes.clear()  # Clear processed postcodes
                # open new input postcode file
                if os.path.exists(f"src/data/os-open/{current_prefix}.csv"):
                    if postcode_file:
                        postcode_file.close()
                    postcode_file = open(
                        f"src/data/os-open/{current_prefix}.csv", mode="r", newline="\n"
                    )
                    postcode_reader = csv.reader(postcode_file)
                    last_prefix = current_prefix
                else:
                    print(f"File '{current_prefix}.csv' does not exist.")
                    omitted.append(current_prefix)
                    current_prefix = None
                    last_prefix = None
                    continue

                # open new output postcode file
                if subset:
                    print(f"Finished writing postcode data to {subset_file.name}.")
                    subset_file.close()
                subset_file = open(
                    f"{output_dir}/{current_prefix}.csv", mode="w", newline="\n"
                )
                subset = csv.writer(subset_file)
                subset.writerow(["Postcode", "Type", "Northings", "Eastings"])

            # Check if postcode has already been processed
            if refined_row[0] in processed_postcodes:
                continue

            # Find postcode NE
            northings = None
            eastings = None

            if postcode_file and postcode_reader:
                for index, postcode in enumerate(
                    postcode_reader
                ):  # This is tragically slow.
                    cleaned_postcode = (
                        postcode[0].replace(" ", "", -1).replace('"', "", -1)
                    )
                    if cleaned_postcode == refined_row[0]:
                        northings = postcode[3]
                        eastings = postcode[2]
                        break

            if subset:
                if northings and eastings:
                    refined_row.append(northings)
                    refined_row.append(eastings)
                    subset.writerow(refined_row)
                else:
                    refined_row.append("0")
                    refined_row.append("0")
                    subset.writerow(refined_row)
            else:
                print(f"Output file not made for postcode '{refined_row[0]}'.")

            # Hilariously, there is redundant data in the Experian dataset.
            processed_postcodes.add(refined_row[0])

    print(
        f"Processed data written to '{output_dir}' with the following omitted regions: {omitted}."
    )
    if postcode_file:
        postcode_file.close()
    if subset_file:
        subset_file.close()
