import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { SignUpValidation } from "@/lib/validations/auth";
import { UserService } from "@/server/services/user.service";
import { TRPCError } from "@trpc/server";
import { userUpdateSchema } from "@/lib/validations/user";

export const userRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(SignUpValidation)
    .mutation(async ({ input }) => {
      const user = UserService.createUser({
        role: "communityMember",
        verified: false,
        ...input,
      });
      if (!user) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return user;
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await UserService.getUserById(input.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return user;
    }),

  updateUserProfile: publicProcedure
    .input(
      z.object({
        id: z.string(),
        updates: userUpdateSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const user = await UserService.getUserById(input.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return await UserService.updateUser(input.id, input.updates);
    }),

  /**
   * Adds a plot to the user's favourite plots.
   * NOTE: There does not exist functionality to remove a plot, is this intentional?
   */
  updateFavouritePlots: publicProcedure
    .input(z.object({ plotID: z.string(), userID: z.string() }))
    .mutation(async ({ input }) => {
      const user = await UserService.getUserById(input.userID);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const favourites = user.favouritePlots || [];

      //check if already in
      if (!favourites.includes(input.plotID)) {
        favourites.push(input.plotID);
      }

      return await UserService.updateUser(input.userID, {
        favouritePlots: favourites,
      });
    }),

  /**
   * Modifies a user's points either by setting to a specific value or adjusting by an offset
   */
  updatePoints: publicProcedure
    .input(
      z.object({
        id: z.string(),
        action: z.discriminatedUnion("type", [
          z.object({ type: z.literal("set"), value: z.number().min(0) }),
          z.object({ type: z.literal("offset"), value: z.number() }),
        ]),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.action.type === "set") {
        const user = await UserService.updateUser(input.id, {
          points: input.action.value,
        });
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return user;
      } else {
        const user = await UserService.getUserById(input.id);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const currentPoints = user.points || 0;
        const newPoints = currentPoints + input.action.value;

        if (newPoints < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Points cannot be negative. Current points: " + currentPoints,
          });
        }

        return await UserService.updateUser(input.id, { points: newPoints });
      }
    }),
  getUserListings: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const listings = await UserService.getUserListings(input.userId);

      return listings;
    }),
  getNotificationCount: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await UserService.getUserById(input.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return { notificationCount: user.notificationCount ?? 0 };
    }),
});
