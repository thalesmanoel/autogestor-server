import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'

import ProviderService from '../../services/ProviderService'

export default class ProviderController {
  private providerService: ProviderService

  constructor () {
    this.providerService = new ProviderService()
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = await this.providerService.create(req.body)
      res.status(201).json(provider)
    } catch (error) {
      next(error)
    }
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier, search, page, limit, date } = req.query

      const providers = await this.providerService.aggregatePaginate(
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
        date ? new Date(String(date)) : undefined,
        identifier ? String(identifier) : undefined,
        search ? String(search) : undefined
      )
      res.json(providers)
    } catch (error) {
      next(error)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = await this.providerService.findById(new Types.ObjectId(req.params.id))
      if (!provider) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(provider)
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const data = req.body

      const provider = await this.providerService.update(new Types.ObjectId(id), data)
      if (!provider) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(provider)
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = await this.providerService.delete(new Types.ObjectId(req.params.id))
      if (!provider) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json({ message: 'Produto deletado com sucesso' })
    } catch (error) {
      next(error)
    }
  }
}
