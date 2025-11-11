import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'

import BuyService from '../../services/BuyService'

export default class BuyController {
  private buyService: BuyService

  constructor () {
    this.buyService = new BuyService()
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Usuário não autenticado' })
      }

      const userId = req.user.id
      const data = req.body
      data.serviceOrderId = new Types.ObjectId(data.serviceOrderId)
      data.userId = new Types.ObjectId(userId)

      const buy = await this.buyService.createBuy(data)
      res.status(201).json(buy)
    } catch (error) {
      next(error)
    }
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier, search, page, limit, date } = req.query

      const buys = await this.buyService.aggregatePaginate(
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
        date ? new Date(String(date)) : undefined,
        identifier ? String(identifier) : undefined,
        search ? String(search) : undefined
      )
      res.json(buys.data)
    } catch (error) {
      next(error)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buy = await this.buyService.findById(new Types.ObjectId(req.params.id))
      if (buy === null) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(buy)
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const data = req.body

      const buy = await this.buyService.updateBuy(new Types.ObjectId(id), data)
      if (!buy) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(buy)
    } catch (error) {
      next(error)
    }
  }

  getProductHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params
      const history = await this.buyService.getProductHistory(new Types.ObjectId(productId))
      res.json(history)
    } catch (error) {
      next(error)
    }
  }

  authorize = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { authorization } = req.body

      const changedAuthorizationByUser = req.user?.id

      const buy = await this.buyService.authorize(new Types.ObjectId(id), authorization, new Types.ObjectId(changedAuthorizationByUser))

      if (buy == null) { return res.status(404).json({ message: 'Solicitação de compra não encontrada' }) }
      res.json(buy)
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buy = await this.buyService.delete(new Types.ObjectId(req.params.id))
      if (!buy) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json({ message: 'Produto deletado com sucesso' })
    } catch (error) {
      next(error)
    }
  }
}
