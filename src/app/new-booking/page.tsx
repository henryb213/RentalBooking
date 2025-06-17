"use client";
import BookingUI from "@/components/rental/booking-calendar";

export default function NewBookingPage() {
    return (
        <>
            <BookingUI />
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">New Booking</h1>
                    <p className="text-lg text-secondary-foreground">
                        This page is under construction. Please check back later!
                    </p>
                </div>
            </div>
        </>

    );
}