import Vehicle, {IVehicle} from "../models/Vehicle";
import BaseRepository from "./BaseRepository";

export default class VehicleRepository extends BaseRepository<IVehicle> {
  constructor() {
    super(Vehicle);
  }
}