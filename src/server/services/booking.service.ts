import { connectDB } from "@/lib/mongo";
import { Booking } from "@/lib/models";
import {
    createBookingSchema,
    updateBookingSchema
} from "@/lib/validations/booking";
import { z } from "zod";
import { IBooking } from "@/types/booking";

export class BookingService {
    static async createBooking(
        input: z.infer<typeof createBookingSchema>,
    ): Promise<{ booking: IBooking }> {
        await connectDB();

        const booking = await Booking.create({
            startDate: input.startDate,
            endDate: input.endDate,
            guests: input.guests,
            totalPrice: input.totalPrice,
            status: input.status,
            notes: input.notes,
        });
        
        return { booking: booking };
    }

    static async getBookingById(id: string): Promise<IBooking | null> {
        await connectDB();
        const booking = await Booking.findById<IBooking>(id).exec();

        if (!booking) return null;

        return booking;
    }

    static async updateBooking(
        updates: z.infer<typeof updateBookingSchema>,
    ): Promise<IBooking | null> {
        await connectDB();

        const booking = await Booking.findByIdAndUpdate(
            updates.id,
            { $set: updates },
            { new: true, runValidators: true },
        );

        if (!booking) {
            return null;
        }

        return booking;
    }

    static async deleteBooking(id: string): Promise<boolean> {
        await connectDB();
        const result = await Booking.findByIdAndDelete(id);
        return result !== null;
    }
}
