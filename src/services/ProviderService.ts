import { IProvider } from "../models/Provider";
import ProviderRepository from "../repositories/ProviderRepository";
import BaseService from "./BaseService";

export default class ProviderService extends BaseService<IProvider> {
  constructor() {
    super(new ProviderRepository());
  }
}
