import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'

import ProductService from '../../services/ProductService'

export default class ProductController {
  private productService: ProductService

  constructor () {
    this.productService = new ProductService()
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.create(req.body)
      res.status(201).json(product)
    } catch (error) {
      next(error)
    }
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, date, identifier, search } = req.query

      const identifierVerified = identifier ? String(identifier) : undefined
      const searchVerified = search ? String(search) : undefined
      const dateVerified = date ? new Date(String(date)) : undefined

      const products = await this.productService.aggregatePaginate(
        Number(page),
        Number(limit),
        dateVerified,
        identifierVerified,
        searchVerified
      )
      res.json(products)
    } catch (error) {
      next(error)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.findById(new Types.ObjectId(req.params.id))
      if (!product) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(product)
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const data = req.body

      const product = await this.productService.update(new Types.ObjectId(id), data)
      if (!product) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(product)
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.delete(new Types.ObjectId(req.params.id))
      if (!product) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json({ message: 'Produto deletado com sucesso' })
    } catch (error) {
      next(error)
    }
  }
}
