import mongoose, { Document, Model } from "mongoose";

export interface IBooking {
  startDate: Date;
  endDate: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface IBookingD extends IBooking, Document {}
export interface IBookingM extends Model<IBookingD> {}