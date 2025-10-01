import { Document, FilterQuery, HydratedDocument, Model, Types } from 'mongoose'

import Counter from '../models/Counter'

export type BaseDoc<T> = HydratedDocument<T>

export default class BaseRepository<T extends Document> {
  protected model: Model<T>

  constructor (model: Model<T>) {
    this.model = model
  }

  async create (data: Partial<T>): Promise<BaseDoc<T>> {
    return this.model.create(data) as Promise<BaseDoc<T>>
  }

  async findAll (): Promise<T[]> {
    return this.model.find()
  }

  async findOne (filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter)
  }

  findById (id: Types.ObjectId) {
    return this.model.findById(id)
  }

  async updateOne (filter: FilterQuery<T>, data: Partial<T>, upsert = false): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, data, { new: true, upsert })
  }

  async updateWithOperators (filter: FilterQuery<T>, update: any, upsert = false) {
    return this.model.findOneAndUpdate(filter, update, { upsert, new: true })
  }

  async update (id: Types.ObjectId, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true })
  }

  async delete (id: Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndDelete(id)
  }

  async aggregateMany (pipeline: any[]) {
    return this.model.aggregate(pipeline)
  }

  async aggregatePaginate (pipeline: any[], page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const result = await this.model.aggregate([
      ...pipeline,
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ])

    const data = result[0].data
    const total = result[0].totalCount[0]?.count || 0

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getNextSequence (name: string): Promise<number> {
    const counter = await Counter.findByIdAndUpdate(
      name,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )
    return counter.seq
  }
}
