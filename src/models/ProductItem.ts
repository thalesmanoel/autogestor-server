import { Schema, Types } from 'mongoose'

export interface IProductItem {
  productId?: Types.ObjectId;
  code?: number;
  name: string;
  quantityToServiceOrder?: number;
  quantityToStock?: number;
  totalQuantity?: number;
  costUnitPrice?: number;
  salePrice?: number;
  grossProfitMargin?: number;
  providerIds?: Types.ObjectId[];
}

export const ProductItemSchema = new Schema<IProductItem>(
  {
    productId: { type: Schema.Types.ObjectId },
    code: { type: Number },
    name: { type: String, required: true },
    quantityToServiceOrder: { type: Number, required: true },
    quantityToStock: { type: Number, required: true },
    totalQuantity: { type: Number, required: true },
    costUnitPrice: { type: Number },
    salePrice: { type: Number },
    grossProfitMargin: { type: Number },
    providerIds: { type: [Schema.Types.ObjectId] }
  },
  { _id: false }
)
