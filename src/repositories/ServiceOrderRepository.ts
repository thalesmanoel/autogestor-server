import ServiceOrder, { IServiceOrder } from '../models/ServiceOrder'
import BaseRepository from './BaseRepository'

export default class ServiceOrderRepository extends BaseRepository<IServiceOrder> {
  constructor () {
    super(ServiceOrder)
  }
}
