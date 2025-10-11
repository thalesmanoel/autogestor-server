import mongoose, { Document, Schema } from 'mongoose'

export interface IProvider extends Document {
    name: string;
    cnpj?: string;
    stateRegistration?: string;
    cep?: string;
    address: string;
    number?: string;
    city?: string;
    state?: string;
    email?: string;
    cellphone: string;
    notes?: string;
}

const ProviderSchema = new Schema<IProvider>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    cellphone: { type: String, required: true },
    cnpj: { type: String },
    stateRegistration: { type: String },
    cep: { type: String },
    number: { type: String },
    city: { type: String },
    state: { type: String },
    email: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
)

export default mongoose.model<IProvider>('Provider', ProviderSchema)
