import bcrypt from 'bcrypt'
import { Types } from 'mongoose'

import { IUser } from '../models/User'
import UserRepository from '../repositories/UserRepository'
import BaseService from './BaseService'

export default class UserService extends BaseService<IUser> {
  private userRepository: UserRepository
  constructor () {
    super(new UserRepository())
    this.userRepository = new UserRepository()
  }

  async findAllPaginated (
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
      pipeline.push({ $match: { createdAt: { $gte: start, $lte: end } } })
    }

    if (identifier && search !== undefined) {
      const normalized = String(search).toLowerCase().trim()

      if (identifier === 'role') {
        if (normalized === 'admin') {
          pipeline.push({ $match: { role: 'admin' } })
        } else if (normalized === 'employer') {
          pipeline.push({ $match: { role: 'employer', manager: false } })
        }
      } else if (identifier === 'manager' && normalized === 'true') {
        pipeline.push({ $match: { role: 'employer', manager: true } })
      } else {
        let matchValue: any
        if (!isNaN(Number(search))) matchValue = Number(search)
        else matchValue = { $regex: search, $options: 'i' }

        pipeline.push({ $match: { [identifier]: matchValue } })
      }
    }

    pipeline.push({ $sort: { createdAt: -1 } })

    console.log('Pipeline:', JSON.stringify(pipeline, null, 2))

    return this.repository.aggregatePaginate(pipeline, currentPage, currentLimit)
  }

  async changePassword (userId: Types.ObjectId, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return { success: false, message: 'Usuário não encontrado.' }
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return { success: false, message: 'Senha atual incorreta.' }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword

    await user.save()

    return { success: true }
  }
}
