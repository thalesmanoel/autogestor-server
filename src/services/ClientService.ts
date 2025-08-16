import { IClient } from "../models/Client";
import ClientRepository from "../repositories/ClientRepository";
import BaseService from "./BaseService";

export default class ClientService extends BaseService<IClient> {
  constructor() {
    super(new ClientRepository());
  }
}
