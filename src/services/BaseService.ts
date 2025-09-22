import { Document, Types } from 'mongoose'

import BaseRepository from '../repositories/BaseRepository'

export default class BaseService<T extends Document> {
  protected repository: BaseRepository<T>

  constructor (repository: BaseRepository<T>) {
    this.repository = repository
  }

  async create (data: Partial<T>) {
    return this.repository.create(data)
  }

  async findAll () {
    return this.repository.findAll()
  }

  async findById (id: Types.ObjectId) {
    return this.repository.findById(id)
  }

  async update (id: Types.ObjectId, data: Partial<T>) {
    return this.repository.update(id, data)
  }

  async delete (id: Types.ObjectId) {
    return this.repository.delete(id)
  }

  async aggregatePaginate (
    page?: number,
    limit?: number,
    date?: Date,
    identifier?: string,
    search?: string
  ) {
    const pipeline: any[] = []

    const currentPage = page && !isNaN(page) && page > 0 ? page : 1
    const currentLimit = limit && !isNaN(limit) && limit > 0 ? limit : 10

    if (date) {
      const start = new Date(date.getFullYear(), date.getMonth(), 1)
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

      pipeline.push({
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      })
    }

    if (identifier && search) {
      const match: any = {}
      if (isNaN(Number(search))) {
        match[identifier] = { $regex: search, $options: 'i' }
      } else {
        match[identifier] = Number(search)
      }
      pipeline.push({ $match: match })
    }

    pipeline.push({ $sort: { createdAt: -1 } })

    console.log(pipeline)

    return this.repository.aggregatePaginate(pipeline, currentPage, currentLimit)
  }
}
