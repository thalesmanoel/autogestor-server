import mongoose, { Schema, Document } from "mongoose";
import OrderServiceStatus from "../enums/OrderServiceStatus";

export interface IServiceOrder extends Document {
    clientId: mongoose.Types.ObjectId;
    serviceId: mongoose.Types.ObjectId;
    productId?: mongoose.Types.ObjectId;
    description: string;
    technicalAnalysis?: string;
    unitValue: number;
    status: OrderServiceStatus;
    entryDate?: Date;
    deadline?: Date;
    completionDate?: Date;
    pickupDate?: Date;
    totalValue: number;
    paymentType: string;
    paid: boolean;
}

const ServiceOrderSchema = new Schema<IServiceOrder>(
  {
    clientId: { type: Schema.Types.ObjectId, required: true },
    serviceId: { type: Schema.Types.ObjectId, required: true },
    productId: { type: Schema.Types.ObjectId },
    technicalAnalysis: { type: String },
    description: { type: String, required: true },
    unitValue: { type: Number, required: true },  
    status: { type: String, enum: Object.values(OrderServiceStatus) },
    entryDate: { type: Date },
    deadline: { type: Date },
    completionDate: { type: Date },
    pickupDate: { type: Date },
    totalValue: { type: Number },
    paymentType: { type: String, required: true },
    paid: { type: Boolean },
  },
  { timestamps: true }
);

export default mongoose.model<IServiceOrder>("ServiceOrder", ServiceOrderSchema);
