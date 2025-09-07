import mongoose, { Document, Schema } from 'mongoose'

import { IService } from './Service'

export interface IServiceItem extends Document {
  serviceId: mongoose.Types.ObjectId | IService
  title: string
  description?: string
  unitValue: number
  quantity: number
}

export const ServiceItemSchema = new Schema<IServiceItem>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    title: { type: String, required: true },
    description: { type: String },
    unitValue: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 }
  },
  { _id: false }
)
