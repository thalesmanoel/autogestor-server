import { IUser } from "../models/User";
import UserRepository from "../repositories/UserRepository";
import BaseService from "./BaseService";

export default class UserService extends BaseService<IUser> {
  constructor() {
    super(new UserRepository());
  }
}
