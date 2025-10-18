import { Types } from 'mongoose'

import { IClient } from '../models/Client'
import ServiceOrder from '../models/ServiceOrder'
import ClientRepository from '../repositories/ClientRepository'
import BaseService from './BaseService'

export default class ClientService extends BaseService<IClient> {
  constructor () {
    super(new ClientRepository())
  }

  async deleteClient (id: Types.ObjectId): Promise<void> {
    if (!id) throw new Error('ID do cliente é obrigatório para deletar.')

    const order = await ServiceOrder.findOne({ clientId: id }).select('_id').lean()

    if (order) throw new Error('Não é possível deletar um cliente com ordens de serviço associadas.')

    await this.repository.delete(id)
  }
}
