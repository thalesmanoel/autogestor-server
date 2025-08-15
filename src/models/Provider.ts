import mongoose, { Schema, Document } from "mongoose";

export interface IProvider extends Document {
    name: string;
    address: string;
    cellphone: string;
    cnpj: string;
}

const ProviderSchema = new Schema<IProvider>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    cellphone: { type: String, required: true },
    cnpj: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProvider>("Provider", ProviderSchema);
