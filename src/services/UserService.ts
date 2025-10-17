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
