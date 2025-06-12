import * as fs from "fs";
import path from "path";
import csv from "csv-parser";

import {
  IPostcodeType,
  MosaicType,
  IPostcodePreferenceMatrix,
} from "@/types/mosaic";
import type {
  GetListingsOptions,
  PopulatedListing,
} from "@/types/marketplace/listing.interface";
import type {
  PaginatedResponse,
  PaginationOptions,
} from "@/types/pagination.types";
import { MarketService } from "./market.service";
import { Listing, Preference } from "@/lib/models";
import { connectDB } from "@/lib/mongo";

export class mosaicService {
  private static readonly DATA_DIR = path.join(
    process.cwd(),
    "src",
    "data",
    "processed",
    "postcodes",
  );

  static distanceBetweenCoords(
    e1: number, // Eastings
    n1: number, // Northings
    e2: number,
    n2: number,
  ): number {
    const diff_eastings = e2 - e1;
    const diff_northings = n2 - n1;
    return Math.sqrt(
      diff_eastings * diff_eastings + diff_northings * diff_northings,
    );
  }

  static postcodePrefix(postcode: string): string {
    postcode = postcode.toLowerCase().replace(/\s+/g, "");

    const prefix = postcode.slice(0, 2);
    // console.log(`${postcode} -> ${prefix}`);
    return /\d/.test(prefix[1]) ? prefix[0] : prefix;
  }

  static async getPostcodeData(
    postcode: string,
  ): Promise<IPostcodeType | undefined> {
    postcode = postcode.replace(/\s+/g, "");

    const prefix = this.postcodePrefix(postcode);
    const filename = this.DATA_DIR + "/" + prefix + ".csv";

    // Check if file exists before attempting to read
    if (!fs.existsSync(filename)) {
      console.log(`No postcode data file found for prefix: ${prefix}`);
      return undefined;
    }

    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filename).pipe(csv());
      let hit: IPostcodeType | undefined = undefined;

      readStream.on("data", (data) => {
        const candidate: string = data.Postcode?.replace(/\s+/g, "");

        if (candidate === postcode) {
          hit = {
            postcode: data.Postcode,
            group: "F",
            type: data.Type as MosaicType,
            northings: data.Eastings,
            eastings: data.Northings,
          };
          resolve(hit);
        }
      });

      readStream.on("end", () => resolve(undefined));
      readStream.on("error", (e) => {
        console.error(`Error reading postcode data: ${e.message}`);
        resolve(undefined);
      });
    });
  }

  static async getMarketRecommendations(
    postcode: string,
    options: GetListingsOptions = {},
    pagination: PaginationOptions = {},
    _override_preferences?: IPostcodePreferenceMatrix,
    _search_radius: number = 100,
  ): Promise<PaginatedResponse<PopulatedListing>> {
    await connectDB();

    // If type specified, no recommendation required.
    if (options.type) {
      return MarketService.getListings(options, pagination);
    }
    // Get postcode data from csv.
    const postcode_data: IPostcodeType | undefined =
      await this.getPostcodeData(postcode);
    if (!postcode_data) {
      // No postcode data for this postcode! Not our remit.
      console.log(
        `Recommendations for postcode='${postcode}' could not be generated. Likely not type F.`,
      );
      return {
        data: [],
        pagination: {
          total: 0,
          page: 0,
          limit: 0,
          pages: 0,
        },
      };
    }

    if (String(postcode_data.northings) === "None") {
      postcode_data.northings = 0;
      postcode_data.eastings = 0;
    }

    // Now we recommend content based on preferences
    await connectDB();
    console.log(`Getting preferences for: ${postcode_data.type}`);
    const preferences = !_override_preferences
      ? (
          await Preference.findOne({
            groupType: String(postcode_data.type),
          }).exec()
        )?.preferences?.listing_preferences
      : _override_preferences.preferences.listing_preferences;

    console.log(`PREFERENCES: ${preferences}`);

    const num_suggestions = pagination.limit ? pagination.limit : 10;
    const num_items = preferences
      ? Math.round(preferences.item.weight * num_suggestions)
      : Math.round(0.33 * num_suggestions);
    const num_service = preferences
      ? Math.round(preferences.service.weight * num_suggestions)
      : Math.round(0.33 * num_suggestions);
    const num_share = preferences
      ? Math.round(preferences.share.weight * num_suggestions)
      : Math.round(0.33 * num_suggestions);

    const query: Record<string, unknown> = {};
    if (options.status) query.status = options.status;
    if (options.category) query.category = options.category;
    if (options.createdById) query.createdBy = options.createdById;
    if (options.purchasedById) query.purchasedBy = options.purchasedById;

    const [listings, total] = await Promise.all([
      await Listing.aggregate([
        {
          $match: {
            location: {
              $geoWithin: {
                $center: [
                  [
                    Number(postcode_data.eastings) / 10000,
                    Number(postcode_data.northings) / 10000,
                  ],
                  _search_radius, // WARN : Literally no one knows what unit this is in lol
                ],
              },
            },
          },
        },
        {
          $facet: {
            // https://www.mongodb.com/docs/manual/reference/operator/aggregation/facet/
            items: [
              { $match: { ...query, type: "item" } },
              { $sample: { size: num_items } },
            ],
            services: [
              { $match: { ...query, type: "service" } },
              { $sample: { size: num_service } },
            ],
            shares: [
              { $match: { ...query, type: "share" } },
              { $sample: { size: num_share } },
            ],
          },
        },
        {
          $project: {
            merged: { $concatArrays: ["$items", "$services", "$shares"] },
          },
        },
        { $unwind: { path: "$merged", preserveNullAndEmptyArrays: false } },
        {
          $replaceRoot: { newRoot: "$merged" },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
          },
        },
      ]).exec(),
      Listing.countDocuments(query).exec(),
    ]);

    return {
      data: listings,
      pagination: {
        total,
        page: 0,
        limit: num_suggestions,
        pages: Math.ceil(total / total), // TODO : ACTUALLY PAGINATE?
      },
    };
  }
}
