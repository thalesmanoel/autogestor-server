import Service, {IService} from "../models/Service";
import BaseRepository from "./BaseRepository";

export default class ServiceRepository extends BaseRepository<IService> {
  constructor() {
    super(Service);
  }
}