import { Types } from 'mongoose'

import { ConsultarPlacaAPI } from '../integrations/ConsultarPlacaAPI'
import ServiceOrder from '../models/ServiceOrder'
import { IVehicle } from '../models/Vehicle'
import VehicleRepository from '../repositories/VehicleRepository'
import BaseService from './BaseService'

export default class VehicleService extends BaseService<IVehicle> {
  private vehicleRepository: VehicleRepository
  private consultarPlacaAPI: ConsultarPlacaAPI
  constructor () {
    super(new VehicleRepository())
    this.vehicleRepository = new VehicleRepository()
    this.consultarPlacaAPI = new ConsultarPlacaAPI()
  }

  async getDatasByPlate (plate: string) {
    const vehicle = await this.vehicleRepository.findOne({ licensePlate: plate })
    if (vehicle) throw new Error('Veículo já cadastrado no sistema.')

    const data = await this.consultarPlacaAPI.getVehicleDatasByPlate(plate)
    return data
  }

  getVehicleByPlate (plate: string) {
    return this.vehicleRepository.findOne({ licensePlate: plate })
  }

  async deleteVehicle (id: Types.ObjectId): Promise<void> {
    if (!id) throw new Error('ID do veículo é obrigatório para deletar.')

    const order = await ServiceOrder.findOne({ vehicleId: id }).select('_id').lean()

    if (order) throw new Error('Não é possível deletar um veículo com ordens de serviço associadas.')

    await this.repository.delete(id)
  }
}
