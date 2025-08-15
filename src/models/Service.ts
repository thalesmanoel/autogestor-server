import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
    title: string;
    description: string;
    unitValue: number;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    unitValue: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IService>("Service", ServiceSchema);
