import { IService } from "../models/Service";
import ServiceRepository from "../repositories/ServiceRepository";
import BaseService from "./BaseService";

export default class ServiceService extends BaseService<IService> {
  constructor() {
    super(new ServiceRepository());
  }
}
