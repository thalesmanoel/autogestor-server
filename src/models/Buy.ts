import mongoose, { Schema, Document } from "mongoose";

export interface IBuy extends Document {
    nameProduct: string;
    quantity: string;
    price: number;
}

const BuySchema = new Schema<IBuy>(
  {
    nameProduct: { type: String, required: true },
    quantity: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBuy>("Buy", BuySchema);
