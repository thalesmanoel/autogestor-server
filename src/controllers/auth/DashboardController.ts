import { NextFunction, Request, Response } from 'express'

import DashboardService from '../../services/DashboardService'
import ServiceOrderService from '../../services/ServiceOrderService'
import { convertDatesToYearAndMonth } from '../../utils/ConvertDatesToYearAndMonth'

export default class DashboardController {
  private dashboardService: DashboardService
  private serviceOrderService: ServiceOrderService

  constructor () {
    this.dashboardService = new DashboardService()
    this.serviceOrderService = new ServiceOrderService()
  }

  getDashboardMonthly = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.query

      const { startDate, endDate } = await convertDatesToYearAndMonth(date?.toString())

      const dashboards = await this.dashboardService.getDashboardDatas(startDate, endDate)

      res.json(dashboards)
    } catch (error) {
      next(error)
    }
  }

  getAnnualBilling = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year } = req.query
      if (year && isNaN(Number(year))) {
        return res.status(400).json({ message: 'O ano deve ser um número' })
      }
      const annualBilling = await this.dashboardService.getLastMonthsBilling(Number(year) || undefined)

      res.json(annualBilling)
    } catch (error) {
      next(error)
    }
  }

  getServiceOrdersNearDeadline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceOrders = await this.serviceOrderService.checkServiceOrdersNearDeadline()
      res.json(serviceOrders)
    } catch (error) {
      next(error)
    }
  }
}
