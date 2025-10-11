import mongoose, { Document, Schema } from 'mongoose'

export interface IVehicle extends Document {
    brand: string;
    name: string;
    year: number;
    fuel: string;
    licensePlate: string;
    chassi?: string;
    km?: number;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    brand: { type: String, required: true },
    name: { type: String, required: true },
    year: { type: Number, required: true },
    fuel: { type: String, required: true },
    licensePlate: { type: String, required: true },
    chassi: { type: String },
    km: { type: Number }
  },
  { timestamps: true }
)

export default mongoose.model<IVehicle>('Vehicle', VehicleSchema)
