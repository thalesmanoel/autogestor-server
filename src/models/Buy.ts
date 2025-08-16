import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBuy extends Document {
    name: string;
    quantity: number;
    price: number;
    productId?: Types.ObjectId;
}

const BuySchema = new Schema<IBuy>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    productId: { type: Schema.Types.ObjectId }
  },
  { timestamps: true }
);

export default mongoose.model<IBuy>("Buy", BuySchema);
