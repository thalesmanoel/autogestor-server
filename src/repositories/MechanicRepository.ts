import Mechanic, {IMechanic} from "../models/Mechanic";
import BaseRepository from "./BaseRepository";

export default class MechanicRepository extends BaseRepository<IMechanic> {
  constructor() {
    super(Mechanic);
  }
}