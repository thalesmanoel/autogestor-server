import { Types } from 'mongoose'

import OrderServiceStatus from '../enums/OrderServiceStatus'
import { IServiceOrder } from '../models/ServiceOrder'
import ServiceOrderRepository from '../repositories/ServiceOrderRepository'
import BaseService from './BaseService'
import DashboardService from './DashboardService'
import ProductService from './ProductService'

export default class ServiceOrderService extends BaseService<IServiceOrder> {
  private productService: ProductService
  private serviceOrderRepository: ServiceOrderRepository
  private dashboardService: DashboardService
  constructor () {
    super(new ServiceOrderRepository())
    this.productService = new ProductService()
    this.serviceOrderRepository = new ServiceOrderRepository()
    this.dashboardService = new DashboardService()
  }

  async calculateTotals (data: IServiceOrder): Promise<IServiceOrder> {
    let totalProducts = 0

    if (data.products && data.products.length > 0) {
      for (const item of data.products) {
        if (!item.productId) continue // só calcula quando já tem produto real

        const unitPrice = item.salePrice ?? item.costUnitPrice ?? 0
        totalProducts += unitPrice * (item.quantity ?? 0)
      }
    }

    let totalServices = 0
    if (data.services && data.services.length > 0) {
      for (const item of data.services) {
        totalServices += item.totalValue * item.quantity
      }
    }

    data.totalValueProducts = totalProducts
    data.totalValueServices = totalServices
    data.totalValueGeneral = totalProducts + totalServices

    if (data.discountType && data.discountValue) {
      if (data.discountType === 'percent') {
        data.totalValueWithDiscount = data.totalValueGeneral - (data.totalValueGeneral * (data.discountValue / 100))
      } else if (data.discountType === 'real') {
        data.totalValueWithDiscount = data.totalValueGeneral - data.discountValue
      }
    }

    return data
  }

  async createServiceOrder (data: IServiceOrder): Promise<IServiceOrder> {
    await this.calculateTotals(data)

    // Desconta o estoque dos produtos disponíveis
    if (data.products && data.products.length > 0) {
      for (const item of data.products) {
        const product = await this.productService.findById(item.productId as Types.ObjectId)
        if (!product) continue
        const quantity = item.quantity ?? 0

        if (quantity > product.quantity) {
          throw new Error(`Estoque insuficiente para o produto ${product.name}. Em estoque: ${product.quantity}, solicitado: ${quantity}`)
        }

        product.quantity -= quantity
        await product.save()
      }
    }

    const serviceOrder = await this.serviceOrderRepository.create(data)

    return serviceOrder
  }

  async changeStatus (id: Types.ObjectId, status: OrderServiceStatus): Promise<IServiceOrder | null> {
    const serviceOrder = await this.serviceOrderRepository.findById(id)
    if (!serviceOrder) return null

    // Cancelamento da OS -> devolve produtos ao estoque
    if (status === OrderServiceStatus.CANCELED) {
      for (const item of serviceOrder.products ?? []) {
        const product = await this.productService.findById(new Types.ObjectId(item.productId))
        if (!product) continue

        product.quantity += item.quantity ?? 0
        await product.save()
      }

      serviceOrder.status = OrderServiceStatus.CANCELED
      await serviceOrder.save()
      return serviceOrder
    }

    if (status === OrderServiceStatus.COMPLETED) {
      serviceOrder.status = OrderServiceStatus.COMPLETED
      serviceOrder.completionDate = new Date()
      if (!serviceOrder.paid) {
        this.updatePaidStatus(id, true)
      }
      await serviceOrder.save()
      return serviceOrder
    }

    // Para outros status, apenas atualiza o status
    serviceOrder.status = status
    await serviceOrder.save()
    return serviceOrder
  }

  // Atualiza uma ordem de serviço e recalcula os totais
  async updateServiceOrder (id: Types.ObjectId, data: Partial<IServiceOrder>): Promise<IServiceOrder | null> {
    const existingOrder = await this.serviceOrderRepository.findById(id)
    if (!existingOrder) return null

    const mergedData = { ...existingOrder.toObject(), ...data }

    const totals = await this.calculateTotals(mergedData as IServiceOrder)
    Object.assign(data, totals)

    return this.serviceOrderRepository.update(id, data)
  }

  async updatePaidStatus (serviceOrderId: Types.ObjectId, paid: boolean, paymentType?: string) {
    const order = await this.serviceOrderRepository.findById(serviceOrderId)
    if (!order) throw new Error('Ordem de serviço não encontrada')

    order.paid = paid
    order.paymentDate = paid ? new Date() : undefined
    order.paymentType = paymentType || 'não informado'
    await order.save()

    if (paid) {
      await this.dashboardService.incrementMonthlyDashboard(order)
    }
  }

  // async exportPdf (serviceOrderId: Types.ObjectId, res: Response) {
  //   const order = await this.serviceOrderRepository.findById(serviceOrderId)
  //     .populate('clientId')
  //     .populate('serviceId')
  //     .populate('products.productId')
  //     .lean()
  //     .exec()

  //   if (!order) {
  //     throw new Error('Ordem de serviço não encontrada')
  //   }

  //   // Criar o documento PDF
  //   const doc = new PDFDocument({ margin: 40 })
  //   res.setHeader('Content-Type', 'application/pdf')
  //   res.setHeader('Content-Disposition', `inline; filename=OS-${order.code}.pdf`)
  //   doc.pipe(res)

  //   // Título
  //   doc.fontSize(18).text(`Ordem de Serviço - ${order.code}`, { align: 'center' })
  //   doc.moveDown()

  //   // Cliente
  //   if (order.clientId && typeof order.clientId === 'object' && 'name' in order.clientId) {
  //     doc.text(`Cliente: ${(order.clientId as any).name}`)
  //   } else {
  //     doc.text('Cliente: -')
  //   }

  //   // Serviço
  //   if (order.serviceId && typeof order.serviceId === 'object' && 'name' in order.serviceId) {
  //     doc.text(`Serviço: ${(order.serviceId as any).name}`)
  //   } else {
  //     doc.text('Serviço: -')
  //   }

  //   // Dados principais
  //   doc.text(`Descrição: ${order.description}`)
  //   doc.text(`Status: ${order.status}`)
  //   doc.text(`Entrada: ${order.entryDate ? new Date(order.entryDate).toLocaleDateString() : '-'}`)
  //   doc.text(`Prazo: ${order.deadline ? new Date(order.deadline).toLocaleDateString() : '-'}`)
  //   doc.moveDown()

  //   // Produtos (se houver)
  //   if (order.products && order.products.length > 0) {
  //     doc.fontSize(14).text('Produtos:', { underline: true })
  //     doc.moveDown(0.5)

  //     order.products.forEach((p: any, i: number) => {
  //       doc.fontSize(12).text(
  //         `${i + 1}. ${p.productId?.name || '-'} | Qtde: ${p.quantity} | Valor: R$ ${
  //           p.salePrice?.toFixed(2) || '0.00'
  //         }`
  //       )
  //     })
  //     doc.moveDown()
  //   }

  //   // Totais
  //   doc.fontSize(12).text(`Total Produtos: R$ ${order.totalValueProducts?.toFixed(2) || '0.00'}`)
  //   doc.text(`Total Serviços: R$ ${order.totalValueServices?.toFixed(2) || '0.00'}`)
  //   doc.text(`Total Geral: R$ ${order.totalValueGeneral?.toFixed(2) || '0.00'}`)
  //   doc.text(`Forma de pagamento: ${order.paymentType || '-'}`)
  //   doc.text(`Pago: ${order.paid ? 'Sim' : 'Não'}`)

  //   doc.end()
  // }
}
