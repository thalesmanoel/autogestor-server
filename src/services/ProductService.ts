import { Types } from "mongoose";
import { IProduct } from "../models/Product";
import ProductRepository from "../repositories/ProductRepository";
import BaseService from "./BaseService";

export default class ProductService extends BaseService<IProduct> {
  constructor() {
    super(new ProductRepository());
  }

  async addQuantity(id: Types.ObjectId, quantity: number): Promise<IProduct | null> {
    const product = await this.repository.findById(id);
    if (!product) 
      return null;

    product.quantity += quantity;
    await this.repository.update(id, product);
    return product;
  }

  async removeQuantity(id: Types.ObjectId, quantity: number): Promise<IProduct | null> {
    const product = await this.repository.findById(id);
    if (!product) return null;

    product.quantity -= quantity;
    if (product.quantity < 0) product.quantity = 0;

    await this.repository.update(id, product);
    return product;
  }
}
