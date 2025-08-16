import { Model, Document, Types } from "mongoose";

export default class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findAll(): Promise<T[]> {
    return this.model.find();
  }

  async findById(id: Types.ObjectId): Promise<T | null> {
    return this.model.findById(id);
  }

  async update(id: Types.ObjectId, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }
}
