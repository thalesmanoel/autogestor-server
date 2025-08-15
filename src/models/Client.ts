import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
    name: string;
    email: string;
    address: string;
    cellphone: string;
    vehicleId: mongoose.Types.ObjectId;
    cpf: string;
    cnpj: string;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String },
    email: { type: String },
    address: { type: String },
    cellphone: { type: String },
    cpf: { type: String },
    cnpj: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IClient>("Client", ClientSchema);
