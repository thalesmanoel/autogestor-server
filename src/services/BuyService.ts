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
    if (data.productId) {
      await this.productService.addQuantity(data.productId, data.quantity);
    }else{
      await this.productService.create(data);
    }

    return this.repository.create(data);
  }
}
