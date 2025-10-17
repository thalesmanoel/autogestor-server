import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'

import UserService from '../../services/UserService'

export default class UserController {
  private userService: UserService

  constructor () {
    this.userService = new UserService()
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.create(req.body)
      res.status(201).json(user)
    } catch (error) {
      next(error)
    }
  }

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.findAll()
      res.json(users)
    } catch (error) {
      next(error)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.findById(new Types.ObjectId(req.params.id))
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })
      res.json(user)
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const data = req.body

      const user = await this.userService.update(new Types.ObjectId(id), data)
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })
      res.json(user)
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.delete(new Types.ObjectId(req.params.id))
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })
      res.json({ message: 'Usuário deletado com sucesso' })
    } catch (error) {
      next(error)
    }
  }

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Senhas não informadas.' })
      }

      const result = await this.userService.changePassword(new Types.ObjectId(id), currentPassword, newPassword)

      if (!result.success) {
        return res.status(400).json({ message: result.message })
      }

      res.json({ message: 'Senha alterada com sucesso.' })
    } catch (error) {
      next(error)
    }
  }
}
