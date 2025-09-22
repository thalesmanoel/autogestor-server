import Dashboard, { IDashboard } from '../models/Dashboard'
import BaseRepository from './BaseRepository'

export default class DashboardRepository extends BaseRepository<IDashboard> {
  constructor () {
    super(Dashboard)
  }
}
