import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import { paginationSchema } from "@/lib/validations/api";
import { MarketService } from "@/server/services/market.service";
import {
  listingCreateSchema,
  listingUpdateSchema,
} from "@/lib/validations/marketplace/listing.schema";
import { TRPCError } from "@trpc/server";

export const marketplaceRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        ...paginationSchema.shape,
        // type: z.enum(["item", "other"]).optional(),
        status: z.enum(["open", "closed"]).optional(),
      }),
    )
    .query(async ({ input }) => {
      const { page, limit, status } = input;
      const listings = await MarketService.getListings(
        { status },
        { page, limit },
      );
      return listings;
    }),

  create: publicProcedure
    .input(
      z.object({
        ...listingCreateSchema.shape,
      }),
    )
    .mutation(async ({ input }) => {
      const listing = await MarketService.createListing(input);
      if (!listing) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return listing;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const listing = await MarketService.getListingById(input.id);
      if (!listing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return listing;
    }),

  update: publicProcedure
    .input(z.object({ id: z.string(), ...listingUpdateSchema.shape }))
    .mutation(async ({ input }) => {
      const listing = await MarketService.updateListing(input.id, input);
      if (!listing) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return listing;
    }),

  purchase: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      const res = await MarketService.purchaseListing(input.id, input.userId);
      return res;
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().optional(),
        status: z.enum(["open", "closed"]).optional(),
        category: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { query, limit, status, category } = input;
      const listings = await MarketService.searchListings(query, {
        limit,
        status,
        category,
      });
      return listings;
    }),
});
