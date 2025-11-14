import mongoose, { Document, Schema } from 'mongoose'

export interface IMechanic extends Document {
    name: string;
    email: string;
    cpf: string;
    cellphone: string;
    position: string;
    cep: string;
    address: string;
    number: number;
    city: string;
    state: string;
    notes?: string;
}

const MechanicSchema = new Schema<IMechanic>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cpf: { type: String, required: true, unique: true },
    cellphone: { type: String, required: true },
    position: { type: String, required: true },
    cep: { type: String, required: true },
    address: { type: String, required: true },
    number: { type: Number, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    notes: { type: String }
  },
  { timestamps: true }
)

export default mongoose.model<IMechanic>('Mechanic', MechanicSchema)
