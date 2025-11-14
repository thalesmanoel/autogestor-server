import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IClient extends Document {
    name: string;
    email: string;
    address: string;
    number: number;
    city: string;
    state: string;
    cep: string;
    cellphone: string;
    vehicleIds?: Types.ObjectId[];
    stateRegistration?: string;
    cpf?: string;
    cnpj?: string;
    notes?: string;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    cellphone: { type: String, required: true },
    vehicleIds: [{ type: Schema.Types.ObjectId }],
    stateRegistration: { type: String },
    number: { type: Number },
    city: { type: String },
    state: { type: String },
    cep: { type: String },
    notes: { type: String },
    cpf: { type: String },
    cnpj: { type: String }
  },
  { timestamps: true }
)

export default mongoose.model<IClient>('Client', ClientSchema)
