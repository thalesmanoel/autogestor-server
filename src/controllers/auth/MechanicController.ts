import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'

import MechanicService from '../../services/MechanicService'
import { Validation } from '../../utils/validation'

export default class MechanicController {
  private mechanicService: MechanicService
  private validation: Validation

  constructor () {
    this.mechanicService = new MechanicService()
    this.validation = new Validation()
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cpf } = req.body

      if (cpf && !this.validation.cpf(cpf)) return res.status(400).json({ message: 'CPF inválido' })

      const mechanic = await this.mechanicService.create(req.body)
      res.status(201).json(mechanic)
    } catch (error) {
      next(error)
    }
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier, search, page, limit, date } = req.query

      const mechanics = await this.mechanicService.aggregatePaginate(
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
        date ? new Date(String(date)) : undefined,
        identifier ? String(identifier) : undefined,
        search ? String(search) : undefined
      )
      res.json(mechanics.data)
    } catch (error) {
      next(error)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mechanic = await this.mechanicService.findById(new Types.ObjectId(req.params.id))
      if (!mechanic) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(mechanic)
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const data = req.body

      if (data.cpf && !this.validation.cpf(data.cpf)) return res.status(400).json({ message: 'CPF inválido' })

      const mechanic = await this.mechanicService.update(new Types.ObjectId(id), data)
      if (!mechanic) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(mechanic)
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mechanic = await this.mechanicService.delete(new Types.ObjectId(req.params.id))
      if (!mechanic) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json({ message: 'Produto deletado com sucesso' })
    } catch (error) {
      next(error)
    }
  }
}
