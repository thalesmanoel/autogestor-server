import { IMechanic } from "../models/Mechanic";
import MechanicRepository from "../repositories/MechanicRepository";
import BaseService from "./BaseService";

export default class MechanicService extends BaseService<IMechanic> {
  constructor() {
    super(new MechanicRepository());
  }
}
