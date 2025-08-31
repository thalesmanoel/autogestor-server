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

  findById(id: Types.ObjectId) {
    return this.model.findById(id);
  }

  async update(id: Types.ObjectId, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }

  async aggregateMany(pipeline: any[]) {
    return this.model.aggregate(pipeline);
  }

  async aggregatePaginate(pipeline: any[], page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const result = await this.model.aggregate([
      ...pipeline,
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }]
        }
      }
    ]);

    const data = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}

