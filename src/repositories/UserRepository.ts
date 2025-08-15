import User, { IUser } from "../models/User";

export default class UserRepository {
  async create(data: IUser): Promise<IUser> {
    return User.create(data);
  }

  async findAll(): Promise<IUser[]> {
    return User.find();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async update(id: string, data: IUser): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id);
  }
}
