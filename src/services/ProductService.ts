import { HydratedDocument } from 'mongoose'

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
    data.code = await this.productRepository.getNextProductCode()
    return this.productRepository.create(data)
  }
}
