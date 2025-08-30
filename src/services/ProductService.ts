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

  async aggregatePaginate(
    page?: number,
    limit?: number,
    date?: Date,
    identifier?: string,
    search?: string
  ) {
    const pipeline: any[] = [];

    if (date) {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      pipeline.push({
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      });
    }

    if (identifier && search) {
      const match: any = {};

      switch (identifier) {
        case "descricao":
          match.descricao = { $regex: search, $options: "i" }; 
          break;

        case "estoque":
          const estoque = parseInt(search, 10);
          if (!isNaN(estoque)) {
            match.estoque = estoque;
          }
          break;

        case "fornecedor":
          match.fornecedor = { $regex: search, $options: "i" };
          break;

        case "valorVenda":
          const valor = parseFloat(search);
          if (!isNaN(valor)) {
            match.valorVenda = valor;
          }
          break;

        default:
          break;
      }

      if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
      }
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    return this.repository.aggregatePaginate(pipeline, page, limit);
  }
}
