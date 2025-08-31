import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
    name: string;
    quantity: number;
    costUnitPrice: number;
    salePrice?: number;
    grossProfitMargin?: number;
    providerId?: mongoose.Types.ObjectId;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId },
    costUnitPrice: { type: Number, required: true },
    salePrice: { type: Number },
    grossProfitMargin: { type: Number }
  },
  { timestamps: true }
)

export default mongoose.model<IProduct>('Product', ProductSchema)
