import mongoose, { Schema, Document, Types } from "mongoose";
import RequestBuyStatus from '../enums/RequestBuyStatus';

export interface IBuy extends Document {
    name: string;
    quantity: number;
    costUnitPrice: number;
    salePrice?: number;
    grossProfitMargin?: number;
    productId?: Types.ObjectId;
    providerId?: Types.ObjectId;
    authorized?: boolean;
    requestDate?: Date;
    orderServiceId?: Types.ObjectId;
    status?: RequestBuyStatus;
}

const BuySchema = new Schema<IBuy>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    costUnitPrice: { type: Number, required: true },
    salePrice: { type: Number },
    grossProfitMargin: { type: Number },
    productId: { type: Schema.Types.ObjectId },
    providerId: { type: Schema.Types.ObjectId },
    authorized: { type: Boolean },
    requestDate: { type: Date },
    orderServiceId: { type: Schema.Types.ObjectId },
    status: { type: String, enum: Object.values(RequestBuyStatus) },
  },
  { timestamps: true }
);

export default mongoose.model<IBuy>("Buy", BuySchema);
