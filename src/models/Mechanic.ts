import mongoose, { Schema, Document } from "mongoose";

export interface IMechanic extends Document {
    name: string;
    email: string;
    cellphone: string;
    address: string;
}

const MechanicSchema = new Schema<IMechanic>(
  {
    name: { type: String },
    email: { type: String },
    cellphone: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IMechanic>("Mechanic", MechanicSchema);
