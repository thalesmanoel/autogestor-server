import { Document } from 'mongoose'

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
