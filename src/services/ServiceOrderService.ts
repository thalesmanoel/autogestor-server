import { IServiceOrder } from "../models/ServiceOrder";
import ServiceOrderRepository from "../repositories/ServiceOrderRepository";
import BaseService from "./BaseService";
import Product from "../models/Product";
import Buy from "../models/Buy";
import RequestBuyStatus from "../enums/RequestBuyStatus";
import OrderServiceStatus from "../enums/OrderServiceStatus";

export default class ServiceOrderService extends BaseService<IServiceOrder> {
  constructor() {
    super(new ServiceOrderRepository());
  }

  async createServiceOrder(data: IServiceOrder): Promise<IServiceOrder> {
  if (data.productIds && data.productIds.length > 0) {
    for (const id of data.productIds) {
      const product = await Product.findById(id);

      if (product && product.quantity < 1) {
        const requestBuy = await Buy.findOne({
          "products.productId": id,
        });

        if (requestBuy && requestBuy.status !== RequestBuyStatus.DELIVERED) {
          data.status = OrderServiceStatus.PENDING;
          break;
        }
      }
    }
  }

  return this.repository.create(data);
}


}
