import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    quantity: string;
    providerId: mongoose.Types.ObjectId;
    price: number;
    sellPrice: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    quantity: { type: String, required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId },
    price: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
