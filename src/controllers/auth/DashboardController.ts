import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'

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

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const data = req.body

      const dashboard = await this.dashboardService.update(new Types.ObjectId(id), data)
      if (!dashboard) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(dashboard)
    } catch (error) {
      next(error)
    }
  }
}
