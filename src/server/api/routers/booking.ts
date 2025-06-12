import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import mongoose from "mongoose";
import { BookingService } from "@/server/services/booking.service";
import {
    createBookingSchema,
    updateBookingSchema,
    getBookingByIdSchema,
    deleteBookingSchema,
} from "@/lib/validations/booking";

export const bookingRouter = createTRPCRouter({

  create: publicProcedure
    .input(createBookingSchema)
    .mutation(async ({ input }) => {
      const booking = await BookingService.createBooking(input);
      return booking;
    }),

  getById: publicProcedure
    .input(getBookingByIdSchema)
    .query(async ({ input }) => {
      const booking = await BookingService.getBookingById(input.id);
      return booking;
    }),

  update: publicProcedure
    .input(updateBookingSchema)
    .mutation(async ({ input }) => {
      const booking = await BookingService.updateBooking(input);
      return booking;
    }),

  delete: publicProcedure
    .input(deleteBookingSchema)
    .mutation(async ({ input }) => {
      const result = await BookingService.deleteBooking(input.id);
      return result;
    }),
});
