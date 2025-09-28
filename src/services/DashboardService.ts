import RequestBuyStatus from '../enums/RequestBuyStatus'
import { IDashboard } from '../models/Dashboard'
import BuyRepository from '../repositories/BuyRepository'
import ClientRepository from '../repositories/ClientRepository'
import DashboardRepository from '../repositories/DashboardRepository'
import ServiceOrderRepository from '../repositories/ServiceOrderRepository'
import BaseService from './BaseService'

export default class DashboardService extends BaseService<IDashboard> {
  private dashboardRepository: DashboardRepository
  private serviceOrderRepository: ServiceOrderRepository
  private buyRepository: BuyRepository
  private clientRepository: ClientRepository
  constructor () {
    super(new DashboardRepository())
    this.dashboardRepository = new DashboardRepository()
    this.serviceOrderRepository = new ServiceOrderRepository()
    this.buyRepository = new BuyRepository()
    this.clientRepository = new ClientRepository()
  }

  async getDashboardDatas (startDate?: Date, endDate?: Date) {
    const pipeline: any[] = []

    if (startDate && endDate) {
      pipeline.push({
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      })
    }

    const billingTotalValue = await this.getBillingServiceOrdersTotalValue(pipeline)
    const totalCost = await this.getCostRequestBuys(startDate, endDate)
    const grossProfit = billingTotalValue.totalGeneral - totalCost
    const quantityNewClients = await this.getQuantityNewClients(startDate, endDate)

    return {
      billingTotalValue,
      totalCost,
      grossProfit,
      quantityNewClients
    }
  }

  async getBillingServiceOrdersTotalValue (pipeline: any[]) {
    const result = await this.serviceOrderRepository.aggregateMany([
      ...pipeline,
      { $match: { paid: true } },
      {
        $project: {
          totalValueGeneral: 1,
          totalValueServices: 1,
          totalValueProducts: 1
        }
      },
      {
        $group: {
          _id: null,
          totalGeneral: { $sum: '$totalValueGeneral' },
          totalServices: { $sum: '$totalValueServices' },
          totalProducts: { $sum: '$totalValueProducts' },
          countOrders: { $sum: 1 }
        }
      }
    ])

    return result.length > 0
      ? {
        totalGeneral: result[0].totalGeneral,
        totalServices: result[0].totalServices,
        totalProducts: result[0].totalProducts,
        countOrders: result[0].countOrders
      }
      : { totalGeneral: 0, totalServices: 0, totalProducts: 0, countOrders: 0 }
  }

  async getCostRequestBuys (startDate?: Date, endDate?: Date): Promise<number> {
    const pipeline: any[] = []

    if (startDate && endDate) {
      pipeline.push({
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      })
    }

    const result = await this.buyRepository.aggregateMany([
      ...pipeline,
      {
        $match: {
          status: {
            $in: [
              RequestBuyStatus.DELIVERED,
              RequestBuyStatus.PURCHASED
            ]
          }
        }
      },
      { $unwind: '$products' },
      {
        $project: {
          cost: { $multiply: ['$products.costUnitPrice', '$products.totalQuantity'] }
        }
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' }
        }
      }
    ])

    return result.length > 0 ? result[0].totalCost : 0
  }

  async getQuantityNewClients (startDate?: Date, endDate?: Date) {
    const pipeline: any[] = []

    if (startDate && endDate) {
      pipeline.push({
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      })
    }

    pipeline.push({ $count: 'quantityNewClients' })

    const result = await this.clientRepository.aggregateMany(pipeline)
    return result.length > 0 ? result[0].quantityNewClients : 0
  }
}
