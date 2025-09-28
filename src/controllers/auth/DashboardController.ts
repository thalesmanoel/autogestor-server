import { NextFunction, Request, Response } from 'express'

import DashboardService from '../../services/DashboardService'
import { convertDatesToYearAndMonth } from '../../utils/ConvertDatesToYearAndMonth'

export default class DashboardController {
  private dashboardService: DashboardService

  constructor () {
    this.dashboardService = new DashboardService()
  }

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.query

      const { startDate, endDate } = await convertDatesToYearAndMonth(date?.toString())

      const dashboards = await this.dashboardService.getDashboardDatas(startDate, endDate)

      res.json(dashboards)
    } catch (error) {
      next(error)
    }
  }
}
