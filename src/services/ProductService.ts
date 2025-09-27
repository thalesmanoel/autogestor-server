import { HydratedDocument, Types } from 'mongoose'

import { IProduct } from '../models/Product'
import ProductRepository from '../repositories/ProductRepository'
import BaseService from './BaseService'

type ProductDoc = HydratedDocument<IProduct>

export default class ProductService extends BaseService<IProduct> {
  private productRepository: ProductRepository
  constructor () {
    super(new ProductRepository())
    this.productRepository = new ProductRepository()
  }

  async createProduct (data: Partial<IProduct>): Promise<ProductDoc> {
    data.code = await this.productRepository.getNextSequence('productCode')
    return this.productRepository.create(data)
  }

  async addQuantity (id: Types.ObjectId, quantity: number): Promise<IProduct | null> {
    const product = await this.productRepository.findById(id)
    if (!product) { return null }

    product.quantity += quantity
    await this.productRepository.update(id, product)
    return product
  }

  async removeQuantity (id: Types.ObjectId, quantity: number): Promise<IProduct | null> {
    const product = await this.productRepository.findById(id)
    if (!product) return null

    product.quantity -= quantity
    if (product.quantity < 0) product.quantity = 0

    await this.repository.update(id, product)
    return product
  }
}
