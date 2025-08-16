import { IVehicle } from "../models/Vehicle";
import VehicleRepository from "../repositories/VehicleRepository";
import BaseService from "./BaseService";

export default class VehicleService extends BaseService<IVehicle> {
  constructor() {
    super(new VehicleRepository());
  }
}
