import mongoose, { Schema, Document } from "mongoose";

export interface IMechanic extends Document {
    name: string;
    email: string;
    cellphone: string;
    address: string;
}

const MechanicSchema = new Schema<IMechanic>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cellphone: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMechanic>("Mechanic", MechanicSchema);
