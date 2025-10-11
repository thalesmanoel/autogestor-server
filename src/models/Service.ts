import mongoose, { Document, Schema } from 'mongoose'

export interface IService extends Document {
    title: string;
    description?: string;
    workHours: string;
    hourValue: string;
    totalValue: number;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    description: { type: String },
    workHours: { type: String, required: true },
    hourValue: { type: String, required: true },
    totalValue: { type: Number, required: true }
  },
  { timestamps: true }
)

export default mongoose.model<IService>('Service', ServiceSchema)
