import mongoose, { Document, Schema } from 'mongoose'

export interface ICounter extends Document {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
})

export default mongoose.model<ICounter>('Counter', CounterSchema)
