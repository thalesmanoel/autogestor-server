import { IBuy } from "../models/Buy";
import BuyRepository from "../repositories/BuyRepository";
import BaseService from "./BaseService";
import ProductService from "./ProductService";
import RequestBuyStatus from "../enums/RequestBuyStatus";
import { Types } from "mongoose";

export default class BuyService extends BaseService<IBuy> {
  private productService: ProductService;

  constructor() {
    super(new BuyRepository());
    this.productService = new ProductService();
  }

  async updateBuy(id: Types.ObjectId, data: Partial<IBuy>) {
    const buy = await this.repository.findById(id);
    if (!buy) throw new Error("Solicitação de compra não encontrada");

    const isChangingToDelivered =
      data.status === RequestBuyStatus.DELIVERED && buy.status !== RequestBuyStatus.DELIVERED;

    if (isChangingToDelivered) {
      for (const item of buy.products) {
        const product = await this.productService.findById(item.productId);

        if (!product) continue;

        product.quantity += item.quantity;
        await product.save();
      }
    }

    Object.assign(buy, data);
    await this.repository.update(id, buy);

    return buy;
  }

  async authorize(id: Types.ObjectId, authorization: boolean) {
    let buy = await this.repository.findById(id);
    if (!buy) throw new Error("Solicitação de compra não encontrada");

    if (authorization) {
      buy.authorized = true;
      buy.status = RequestBuyStatus.APPROVED;
    } else {
      buy.authorized = false;
      buy.status = RequestBuyStatus.REJECTED;
    }
    await this.repository.update(id, buy);

    return buy;
  }
}
