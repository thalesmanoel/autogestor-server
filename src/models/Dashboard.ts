import mongoose, { Document, Schema } from 'mongoose'

export interface IDashboard extends Document {
  year: number
  month: number
  billingTotalValue?: number
  servicesTotalValue?: number
  productsTotalValue?: number
  costsTotalValue?: number
  grossProfitTotalValue?: number
  quantityServiceOrdersCompleted?: number
  quantityNewClients?: number
}

const DashboardSchema = new Schema<IDashboard>(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true },
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

DashboardSchema.index({ year: 1, month: 1 }, { unique: true })

export default mongoose.model<IDashboard>('Dashboard', DashboardSchema)
