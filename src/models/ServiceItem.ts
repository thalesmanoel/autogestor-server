import mongoose, { Document, Schema } from 'mongoose'

import { IService } from './Service'

export interface IServiceItem extends Document {
  serviceId: mongoose.Types.ObjectId | IService
  title: string;
  description?: string;
  quantity: number;
  workHours: string;
  hourValue: string;
  totalValue: number;
}

export const ServiceItemSchema = new Schema<IServiceItem>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    title: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    workHours: { type: String, required: true },
    hourValue: { type: String, required: true },
    totalValue: { type: Number, required: true }
  },
  { _id: false }
)
