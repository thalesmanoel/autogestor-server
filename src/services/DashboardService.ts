import { IDashboard } from '../models/Dashboard'
import DashboardRepository from '../repositories/DashboardRepository'
import ServiceOrderRepository from '../repositories/ServiceOrderRepository'
import BaseService from './BaseService'

export default class DashboardService extends BaseService<IDashboard> {
  private dashboardRepository: DashboardRepository
  private serviceOrderRepository: ServiceOrderRepository
  constructor () {
    super(new DashboardRepository())
    this.dashboardRepository = new DashboardRepository()
    this.serviceOrderRepository = new ServiceOrderRepository()
  }

  async getBillingDatas (date: Date | undefined) {
    const pipeline: any[] = []

    if (date) {
      const start = new Date(date.getFullYear(), date.getMonth(), 1)
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

      pipeline.push({
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      })
    }

    const billingTotalValue = await this.getBillingServiceOrdersTotalValue(pipeline)

    return {
      billingTotalValue
    }
  }

  async getBillingServiceOrdersTotalValue (pipeline: any[]): Promise<number> {
    const result = await this.serviceOrderRepository.aggregateMany([
      ...pipeline,
      {
        $project: {
          totalValueGeneral: 1
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalValueGeneral' }
        }
      }
    ])

    return result.length > 0 ? result[0].total : 0
  }
}
