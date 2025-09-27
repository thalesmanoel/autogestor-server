import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'

import DashboardService from '../../services/DashboardService'

export default class DashboardController {
  private dashboardService: DashboardService

  constructor () {
    this.dashboardService = new DashboardService()
  }

  getBillingDatas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.query

      let dateVerified: Date | undefined

      if (date && typeof date === 'string') {
        const [year, month] = date.split('-').map(Number)
        dateVerified = new Date(year, month - 1, 1)
      }

      const dashboards = await this.dashboardService.getBillingDatas(dateVerified)

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
