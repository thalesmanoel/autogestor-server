import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'

import ClientService from '../../services/ClientService'

export default class ClientController {
  private clientService: ClientService

  constructor () {
    this.clientService = new ClientService()
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = await this.clientService.create(req.body)
      res.status(201).json(client)
    } catch (error) {
      next(error)
    }
  }

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const clients = await this.clientService.findAll()
      res.json(clients)
    } catch (error) {
      next(error)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = await this.clientService.findById(new Types.ObjectId(req.params.id))
      if (!client) return res.status(404).json({ message: 'Cliente não encontrado' })
      res.json(client)
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const data = req.body

      const client = await this.clientService.update(new Types.ObjectId(id), data)
      if (!client) return res.status(404).json({ message: 'Cliente não encontrado' })
      res.json(client)
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.clientService.deleteClient(new Types.ObjectId(req.params.id))
      res.json({ message: 'Cliente deletado com sucesso' })
    } catch (error) {
      next(error)
    }
  }
}
