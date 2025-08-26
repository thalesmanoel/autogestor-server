import { IServiceOrder } from "../models/ServiceOrder";
import ServiceOrderRepository from "../repositories/ServiceOrderRepository";
import BaseService from "./BaseService";
import Product from "../models/Product";
import Buy from "../models/Buy";
import RequestBuyStatus from "../enums/RequestBuyStatus";
import OrderServiceStatus from "../enums/OrderServiceStatus";
import { Types } from "mongoose";
import Service from "../models/Service";

export default class ServiceOrderService extends BaseService<IServiceOrder> {
  constructor() {
    super(new ServiceOrderRepository());
  }

  async calculateTotals(data: IServiceOrder): Promise<IServiceOrder> {
    let totalProducts = 0;

    if (data.products && data.products.length > 0) {
      for (const item of data.products) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        totalProducts += (product.salePrice ?? product.costUnitPrice) * item.quantity;

        if (product.quantity < item.quantity) {
          const requestBuy = await Buy.findOne({
            "products.productId": item.productId,
          });

          if (requestBuy && requestBuy.status !== RequestBuyStatus.DELIVERED) {
            data.status = OrderServiceStatus.PENDING;
          }
        }
      }
    }

    let totalServices = 0;
    if (data.serviceId) {
      const service = await Service.findById(data.serviceId);
      if (service) {
        totalServices = service.unitValue;
      }
    }

    data.totalValueProducts = totalProducts;
    data.totalValueServices = totalServices;
    data.totalValueGeneral = totalProducts + totalServices;

    return data;
  }

  async createServiceOrder(data: IServiceOrder): Promise<IServiceOrder> {
    await this.calculateTotals(data);
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
          await product.save();
        }
      }

      await serviceOrder.save();
      return serviceOrder;
    }

    return null;
  }

  async updateServiceOrder(id: Types.ObjectId, data: Partial<IServiceOrder>): Promise<IServiceOrder | null> {
    const existingOrder = await this.repository.findById(id);
    if (!existingOrder) return null;

    const mergedData = { ...existingOrder.toObject(), ...data };
    const totals = await this.calculateTotals(mergedData as IServiceOrder);
    Object.assign(data, totals);

    return this.repository.update(id, data);
  }

}
