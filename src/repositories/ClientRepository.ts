import Client, {IClient} from "../models/Client";
import BaseRepository from "./BaseRepository";

export default class ClientRepository extends BaseRepository<IClient> {
  constructor() {
    super(Client);
  }
}