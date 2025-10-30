import mongoose, { Document, Schema } from 'mongoose'

import { IService } from './Service'

export interface IServiceItem extends Document {
  serviceId: mongoose.Types.ObjectId | IService
  title: string;
  description?: string;
  quantity: number;
  workHours: number;
  hourValue: number;
  totalValue: number;
  mechanicIds?: mongoose.Types.ObjectId[];
}

export const ServiceItemSchema = new Schema<IServiceItem>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    title: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    workHours: { type: Number, required: true },
    hourValue: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    mechanicIds: { type: [Schema.Types.ObjectId] }
  },
  { _id: false }
)
