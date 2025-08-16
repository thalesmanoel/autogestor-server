import { IBuy } from "../models/Buy";
import BuyRepository from "../repositories/BuyRepository";
import BaseService from "./BaseService";

export default class BuyService extends BaseService<IBuy> {
  constructor() {
    super(new BuyRepository());
  }
}
