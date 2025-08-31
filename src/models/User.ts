import mongoose, { Document, Schema } from 'mongoose'

import Role from '../enums/Role'

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  cellphone: string;
  role: Role;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cellphone: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true
    }
  },
  { timestamps: true }
)

export default mongoose.model<IUser>('User', UserSchema)
