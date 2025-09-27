import mongoose, { Document, Schema, Types } from 'mongoose'

import RequestBuyStatus from '../enums/RequestBuyStatus'
import { IProductItem, ProductItemSchema } from './ProductItem'

export interface IBuy extends Document {
  name: string;
  products: IProductItem[];
  authorized?: boolean;
  approvedBy?: Types.ObjectId;
  rejectedBy?: Types.ObjectId;
  deliveredDate?: Date;
  requestDate?: Date;
  serviceOrderId?: Types.ObjectId;
  status?: RequestBuyStatus;
  totalValue?: number;
  userId: Types.ObjectId;
}

const BuySchema = new Schema<IBuy>(
  {
    name: { type: String, required: true },
    products: [ProductItemSchema],
    authorized: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId },
    rejectedBy: { type: Schema.Types.ObjectId },
    deliveredDate: { type: Date },
    requestDate: { type: Date, default: Date.now },
    serviceOrderId: { type: Schema.Types.ObjectId },
    status: { type: String, enum: Object.values(RequestBuyStatus) },
    totalValue: { type: Number },
    userId: { type: Schema.Types.ObjectId, required: true }
  },
  { timestamps: true }
)

export default mongoose.model<IBuy>('Buy', BuySchema)
