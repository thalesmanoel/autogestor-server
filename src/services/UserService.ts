import UserRepository from "../repositories/UserRepository";
import { IUser } from "../models/User";

export default class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async create(data: IUser) {
    return this.userRepository.create(data);
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async update(id: string, data: IUser) {
    return this.userRepository.update(id, data);
  }

  async delete(id: string) {
    return this.userRepository.delete(id);
  }
}
