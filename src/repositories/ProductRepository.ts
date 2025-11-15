import Product, { IProduct } from '../models/Product'
import BaseRepository from './BaseRepository'

export default class ProductRepository extends BaseRepository<IProduct> {
  constructor () {
    super(Product)
  }

  async getNextProductCode (): Promise<number> {
    const lastProduct = await Product
      .findOne({}, { code: 1 })
      .sort({ createdAt: -1 })
      .lean()

    if (!lastProduct || !lastProduct.code) {
      return 1
    }

    const nextCode = lastProduct.code + 1

    return nextCode
  }
}
