import ServiceOrder, { IServiceOrder } from '../models/ServiceOrder'
import BaseRepository from './BaseRepository'

export default class ServiceOrderRepository extends BaseRepository<IServiceOrder> {
  constructor () {
    super(ServiceOrder)
  }

  async getNextServiceOrderCode (): Promise<number> {
    const lastServiceOrder = await ServiceOrder
      .findOne({}, { code: 1 })
      .sort({ createdAt: -1 })
      .lean()

    if (!lastServiceOrder || !lastServiceOrder.code) {
      return 1
    }

    const number = Number(lastServiceOrder.code.split('-')[1])

    const nextCode = number + 1

    return nextCode
  }
}
