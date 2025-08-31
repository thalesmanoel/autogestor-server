import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IClient extends Document {
    name: string;
    email: string;
    address: string;
    cellphone: string;
    vehicleIds?: Types.ObjectId[];
    cpf?: string;
    cnpj?: string;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    cellphone: { type: String, required: true },
    vehicleIds: [{ type: Schema.Types.ObjectId }],
    cpf: { type: String },
    cnpj: { type: String }
  },
  { timestamps: true }
)

export default mongoose.model<IClient>('Client', ClientSchema)
