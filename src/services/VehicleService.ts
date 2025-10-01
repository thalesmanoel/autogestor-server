import { ConsultarPlacaAPI } from '../integrations/ConsultarPlacaAPI'
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
}
