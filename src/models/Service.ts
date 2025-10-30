import mongoose, { Document, Schema } from 'mongoose'

export interface IService extends Document {
    title: string;
    description?: string;
    workHours: number;
    hourValue: number;
    totalValue: number;
    mechanicIds?: mongoose.Types.ObjectId[];
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    description: { type: String },
    workHours: { type: Number, required: true },
    hourValue: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    mechanicIds: { type: [Schema.Types.ObjectId] }
  },
  { timestamps: true }
)

export default mongoose.model<IService>('Service', ServiceSchema)
