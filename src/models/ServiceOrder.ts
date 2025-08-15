import mongoose, { Schema, Document } from "mongoose";
import Status from "../enums/Status";

export interface IServiceOrder extends Document {
    clientId: mongoose.Types.ObjectId;
    serviceId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    description: string;
    technicalAnalysis: string;
    unitValue: number;
    status: Status;
    entryDate: Date;
    deadline: Date;
    completionDate: Date;
    pickupDate: Date;
}

const ServiceOrderSchema = new Schema<IServiceOrder>(
  {
    clientId: { type: Schema.Types.ObjectId },
    serviceId: { type: Schema.Types.ObjectId },
    productId: { type: Schema.Types.ObjectId },
    technicalAnalysis: { type: String },
    description: { type: String },
    unitValue: { type: Number },
    status: { type: String, enum: Object.values(Status) },
    entryDate: { type: Date },
    deadline: { type: Date },
    completionDate: { type: Date },
    pickupDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IServiceOrder>("ServiceOrder", ServiceOrderSchema);
