import { IDashboard } from '../models/Dashboard'
import DashboardRepository from '../repositories/DashboardRepository'
import BaseService from './BaseService'

export default class DashboardService extends BaseService<IDashboard> {
  constructor () {
    super(new DashboardRepository())
  }

  async getBillingDatas (): Promise<IDashboard[]> {
    // return this.repository.findAll()
  }
}
