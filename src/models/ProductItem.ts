import { Schema, Types } from 'mongoose'

export interface IProductItem {
  productId: Types.ObjectId;
  quantity: number;
  costUnitPrice?: number;
  salePrice?: number;
  grossProfitMargin?: number;
  providerId?: Types.ObjectId;
}

export const ProductItemSchema = new Schema<IProductItem>(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true },
    costUnitPrice: { type: Number },
    salePrice: { type: Number },
    grossProfitMargin: { type: Number },
    providerId: { type: Schema.Types.ObjectId }
  },
  { _id: false } // subdocumento, não precisa de _id
)
