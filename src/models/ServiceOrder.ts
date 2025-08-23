import mongoose, { Schema, Document } from "mongoose";
import OrderServiceStatus from "../enums/OrderServiceStatus";

export interface IServiceOrder extends Document {
  code: string;
  clientId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  productIds?: mongoose.Types.ObjectId[];
  description: string;
  technicalAnalysis?: string;
  status: OrderServiceStatus;
  entryDate?: Date;
  deadline?: Date;
  completionDate?: Date;
  pickupDate?: Date;
  totalValueProducts: number;
  totalValueServices: number;
  totalValueGeneral: number;
  paymentType: string;
  paid: boolean;
}

const ServiceOrderSchema = new Schema<IServiceOrder>(
  {
    code: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, required: true },
    serviceId: { type: Schema.Types.ObjectId, required: true },
    productIds: [{ type: Schema.Types.ObjectId }],
    technicalAnalysis: { type: String },
    description: { type: String, required: true },
    status: { type: String, enum: Object.values(OrderServiceStatus) },
    entryDate: { type: Date },
    deadline: { type: Date },
    completionDate: { type: Date },
    pickupDate: { type: Date },
    totalValueProducts: { type: Number },
    totalValueServices: { type: Number },
    totalValueGeneral: { type: Number },
    paymentType: { type: String, required: true },
    paid: { type: Boolean },
  },
  { timestamps: true }
);

export default mongoose.model<IServiceOrder>("ServiceOrder", ServiceOrderSchema);
