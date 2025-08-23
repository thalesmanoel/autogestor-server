import { IBuy } from "../models/Buy";
import BuyRepository from "../repositories/BuyRepository";
import BaseService from "./BaseService";
import ProductService from "./ProductService";

export default class BuyService extends BaseService<IBuy> {
  private productService: ProductService;

  constructor() {
    super(new BuyRepository());
    this.productService = new ProductService();
  }

  async createBuy(data: IBuy): Promise<IBuy> {
    return this.repository.create(data);
  }
}
