import mongoose, { Document, Schema } from 'mongoose'

import OrderServiceStatus from '../enums/OrderServiceStatus'
import { IClient } from './Client'
import { IProductItem, ProductItemSchema } from './ProductItem'
import { IServiceItem, ServiceItemSchema } from './ServiceItem'
import { IVehicle } from './Vehicle'

export interface IServiceOrder extends Document {
  code: string;
  clientId: mongoose.Types.ObjectId | IClient;
  vehicleId: mongoose.Types.ObjectId | IVehicle;
  services?: IServiceItem[];
  products?: IProductItem[];
  descriptionClient?: string;
  notes?: string;
  technicalAnalysis?: string;
  status: OrderServiceStatus;
  entryDate?: Date;
  deadline?: Date;
  completionDate?: Date;
  pickupDate?: Date;
  discountType?: string;
  discountValue?: number;
  totalValueProducts?: number;
  totalValueServices?: number;
  totalValueGeneral?: number;
  totalValueWithDiscount?: number;
  paymentType?: string;
  paid: boolean;
  paymentDate?: Date;
}

const ServiceOrderSchema = new Schema<IServiceOrder>(
  {
    code: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, required: true, ref: 'Client' },
    vehicleId: { type: Schema.Types.ObjectId, required: true, ref: 'Vehicle' },
    services: [ServiceItemSchema],
    products: [ProductItemSchema],
    technicalAnalysis: { type: String },
    descriptionClient: { type: String },
    status: { type: String, enum: Object.values(OrderServiceStatus) },
    entryDate: { type: Date },
    deadline: { type: Date },
    completionDate: { type: Date },
    pickupDate: { type: Date },
    totalValueProducts: { type: Number },
    totalValueServices: { type: Number },
    totalValueGeneral: { type: Number },
    totalValueWithDiscount: { type: Number },
    discountType: { type: String },
    discountValue: { type: Number },
    notes: { type: String },
    paymentType: { type: String },
    paid: { type: Boolean },
    paymentDate: { type: Date }
  },
  { timestamps: true }
)

export default mongoose.model<IServiceOrder>('ServiceOrder', ServiceOrderSchema)
