import mongoose, { Schema, Document, Types } from "mongoose";
import RequestBuyStatus from '../enums/RequestBuyStatus';

export interface IBuyProduct {
  productId: Types.ObjectId;
  quantity: number;
  costUnitPrice: number;
  salePrice?: number;
  grossProfitMargin?: number;
  providerId?: Types.ObjectId;
}

export interface IBuy extends Document {
  name: string;
  products: IBuyProduct[];
  authorized?: boolean;
  requestDate?: Date;
  orderServiceId?: Types.ObjectId;
  status?: RequestBuyStatus;
  totalValue?: number;
}

const BuySchema = new Schema<IBuy>(
  {
    name: { type: String, required: true },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true },
        costUnitPrice: { type: Number, required: true },
        salePrice: { type: Number },
        grossProfitMargin: { type: Number },
        providerId: { type: Schema.Types.ObjectId },
      },
    ],
    authorized: { type: Boolean, default: false },
    requestDate: { type: Date, default: Date.now },
    orderServiceId: { type: Schema.Types.ObjectId },
    status: { type: String, enum: Object.values(RequestBuyStatus) },
    totalValue: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<IBuy>("Buy", BuySchema);
