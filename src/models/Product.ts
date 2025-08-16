import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    quantity: number;
    providerId?: mongoose.Types.ObjectId;
    price: number;
    salePrice?: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId },
    price: { type: Number, required: true },
    salePrice: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
