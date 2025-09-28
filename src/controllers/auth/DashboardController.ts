import { NextFunction, Request, Response } from 'express'

import DashboardService from '../../services/DashboardService'
import { convertDatesToYearAndMonth } from '../../utils/ConvertDatesToYearAndMonth'

export default class DashboardController {
  private dashboardService: DashboardService

  constructor () {
    this.dashboardService = new DashboardService()
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
}
