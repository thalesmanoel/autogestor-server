import { IServiceOrder } from "../models/ServiceOrder";
import ServiceOrderRepository from "../repositories/ServiceOrderRepository";
import BaseService from "./BaseService";
import Product from "../models/Product";
import Buy from "../models/Buy";
import RequestBuyStatus from "../enums/RequestBuyStatus";
import OrderServiceStatus from "../enums/OrderServiceStatus";
import { Types } from "mongoose";

export default class ServiceOrderService extends BaseService<IServiceOrder> {
  constructor() {
    super(new ServiceOrderRepository());
  }

    async createServiceOrder(data: IServiceOrder): Promise<IServiceOrder> {
    if (data.products && data.products.length > 0) {
      for (const item of data.products) {
        const product = await Product.findById(item.productId);

        if (product && product.quantity < item.quantity) {
          const requestBuy = await Buy.findOne({
            "products.productId": item.productId,
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

  async changeStatus(id: Types.ObjectId, status: string): Promise<IServiceOrder | null> {
    const serviceOrder = await this.repository.findById(id);
    if (!serviceOrder) return null;

    if (status === OrderServiceStatus.COMPLETED) {
      serviceOrder.status = OrderServiceStatus.COMPLETED;
      serviceOrder.completionDate = new Date();

      for (const item of serviceOrder.products || []) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.quantity -= item.quantity;
          if (product.quantity < 0) 
            product.quantity = 0;
          await product.save();
        }
      }

      await serviceOrder.save();
      return serviceOrder;
    }

    return null;
  }
}
