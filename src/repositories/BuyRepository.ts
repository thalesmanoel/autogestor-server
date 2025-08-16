import Buy, {IBuy} from "../models/Buy";
import BaseRepository from "./BaseRepository";

export default class BuyRepository extends BaseRepository<IBuy> {
  constructor() {
    super(Buy);
  }
}