import User, { IUser } from "../models/User";
import BaseRepository from "./BaseRepository";

export default class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }
}
