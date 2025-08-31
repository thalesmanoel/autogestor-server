import { IServiceOrder } from "../models/ServiceOrder";
import ServiceOrderRepository from "../repositories/ServiceOrderRepository";
import BaseService from "./BaseService";
import Product from "../models/Product";
import Buy from "../models/Buy";
import RequestBuyStatus from "../enums/RequestBuyStatus";
import OrderServiceStatus from "../enums/OrderServiceStatus";
import { Types } from "mongoose";
import Service from "../models/Service";
import PDFDocument from "pdfkit";
import { Request, Response } from "express";

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

  async exportPdf(serviceOrderId: Types.ObjectId, res: Response) {
    const order = await this.repository.findById(serviceOrderId)
    .populate("clientId") 
    .populate("serviceId")
    .populate("products.productId")
    .lean()
    .exec();

    if (!order) {
      throw new Error("Ordem de serviço não encontrada");
    }

    // Criar o documento PDF
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=OS-${order.code}.pdf`);
    doc.pipe(res);

    // Título
    doc.fontSize(18).text(`Ordem de Serviço - ${order.code}`, { align: "center" });
    doc.moveDown();

    // Cliente
    if (order.clientId && typeof order.clientId === "object" && "name" in order.clientId) {
      doc.text(`Cliente: ${(order.clientId as any).name}`);
    } else {
      doc.text(`Cliente: -`);
    }

    // Serviço
    if (order.serviceId && typeof order.serviceId === "object" && "name" in order.serviceId) {
      doc.text(`Serviço: ${(order.serviceId as any).name}`);
    } else {
      doc.text(`Serviço: -`);
    }
    
    // Dados principais
    doc.text(`Descrição: ${order.description}`);
    doc.text(`Status: ${order.status}`);
    doc.text(`Entrada: ${order.entryDate ? new Date(order.entryDate).toLocaleDateString() : "-"}`);
    doc.text(`Prazo: ${order.deadline ? new Date(order.deadline).toLocaleDateString() : "-"}`);
    doc.moveDown();

    // Produtos (se houver)
    if (order.products && order.products.length > 0) {
      doc.fontSize(14).text("Produtos:", { underline: true });
      doc.moveDown(0.5);

      order.products.forEach((p: any, i: number) => {
        doc.fontSize(12).text(
          `${i + 1}. ${p.productId?.name || "-"} | Qtde: ${p.quantity} | Valor: R$ ${
            p.salePrice?.toFixed(2) || "0.00"
          }`
        );
      });
      doc.moveDown();
    }

    // Totais
    doc.fontSize(12).text(`Total Produtos: R$ ${order.totalValueProducts?.toFixed(2) || "0.00"}`);
    doc.text(`Total Serviços: R$ ${order.totalValueServices?.toFixed(2) || "0.00"}`);
    doc.text(`Total Geral: R$ ${order.totalValueGeneral?.toFixed(2) || "0.00"}`);
    doc.text(`Forma de pagamento: ${order.paymentType || "-"}`);
    doc.text(`Pago: ${order.paid ? "Sim" : "Não"}`);

    doc.end();
  }
}
