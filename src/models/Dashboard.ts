import mongoose, { Document, Schema } from 'mongoose'

export interface IDashboard extends Document {
    billingTotalValue?: number;
    servicesTotalValue?: number;
    productsTotalValue?: number;
    costsTotalValue?: number;
    grossProfitTotalValue?: number;
    quantityServiceOrdersCompleted?: number;
    quantityNewClients?: number;
}

const DashboardSchema = new Schema<IDashboard>(
  {
    billingTotalValue: { type: Number },
    servicesTotalValue: { type: Number },
    productsTotalValue: { type: Number },
    costsTotalValue: { type: Number },
    grossProfitTotalValue: { type: Number },
    quantityServiceOrdersCompleted: { type: Number },
    quantityNewClients: { type: Number }
  },
  { timestamps: true }
)

export default mongoose.model<IDashboard>('Dashboard', DashboardSchema)
