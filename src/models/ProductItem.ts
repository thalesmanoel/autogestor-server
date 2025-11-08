import { Schema, Types } from 'mongoose'

export interface IProductItem {
  productId?: Types.ObjectId;
  code?: number;
  name?: string;
  quantity?: number; // quantidade efetiva utilizada na OS
  quantityToServiceOrder?: number; // quantidade a ser adicionada na OS
  quantityToStock?: number; // quantidade a ser adicionada no estoque
  totalQuantity?: number;
  costUnitPrice?: number;
  salePrice?: number;
  totalValue?: number;
  grossProfitMargin?: number;
  providerIds?: Types.ObjectId[];
}

export const ProductItemSchema = new Schema<IProductItem>(
  {
    productId: { type: Schema.Types.ObjectId },
    code: { type: Number },
    name: { type: String },
    quantity: { type: Number },
    quantityToServiceOrder: { type: Number },
    quantityToStock: { type: Number },
    totalQuantity: { type: Number },
    costUnitPrice: { type: Number },
    salePrice: { type: Number },
    totalValue: { type: Number },
    grossProfitMargin: { type: Number },
    providerIds: { type: [Schema.Types.ObjectId] }
  },
  { _id: false }
)
