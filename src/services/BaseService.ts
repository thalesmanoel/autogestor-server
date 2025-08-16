import BaseRepository from "../repositories/BaseRepository";
import { Document, Types } from "mongoose";

export default class BaseService<T extends Document> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  async create(data: Partial<T>) {
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: Types.ObjectId) {
    return this.repository.findById(id);
  }

  async update(id: Types.ObjectId, data: Partial<T>) {
    return this.repository.update(id, data);
  }

  async delete(id: Types.ObjectId) {
    return this.repository.delete(id);
  }
}
