import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'

import ServiceListService from '../../services/ServiceListService'

export default class ServiceController {
  private serviceListService: ServiceListService

  constructor () {
    this.serviceListService = new ServiceListService()
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = await this.serviceListService.create(req.body)
      res.status(201).json(service)
    } catch (error) {
      next(error)
    }
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier, search, page, limit, date } = req.query

      const services = await this.serviceListService.aggregatePaginate(
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
        date ? new Date(String(date)) : undefined,
        identifier ? String(identifier) : undefined,
        search ? String(search) : undefined
      )
      res.json(services.data)
    } catch (error) {
      next(error)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = await this.serviceListService.findById(new Types.ObjectId(req.params.id))
      if (!service) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(service)
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const data = req.body

      const service = await this.serviceListService.update(new Types.ObjectId(id), data)
      if (!service) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(service)
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = await this.serviceListService.delete(new Types.ObjectId(req.params.id))
      if (!service) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json({ message: 'Produto deletado com sucesso' })
    } catch (error) {
      next(error)
    }
  }
}
