import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'

import VehicleService from '../../services/VehicleService'

export default class VehicleController {
  private vehicleService: VehicleService

  constructor () {
    this.vehicleService = new VehicleService()
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vehicle = await this.vehicleService.create(req.body)
      res.status(201).json(vehicle)
    } catch (error) {
      next(error)
    }
  }

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const vehicles = await this.vehicleService.findAll()
      res.json(vehicles)
    } catch (error) {
      next(error)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vehicle = await this.vehicleService.findById(new Types.ObjectId(req.params.id))
      if (!vehicle) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(vehicle)
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const data = req.body

      const vehicle = await this.vehicleService.update(new Types.ObjectId(id), data)
      if (!vehicle) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(vehicle)
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vehicle = await this.vehicleService.delete(new Types.ObjectId(req.params.id))
      if (!vehicle) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json({ message: 'Produto deletado com sucesso' })
    } catch (error) {
      next(error)
    }
  }
}
