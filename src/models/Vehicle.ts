import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
    brand: string;
    name: string;
    year: number;
    fuel: string;
    clientId: mongoose.Types.ObjectId;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    brand: { type: String, required: true },
    name: { type: String, required: true },
    year: { type: Number, required: true },
    fuel: { type: String, required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IVehicle>("Vehicle", VehicleSchema);