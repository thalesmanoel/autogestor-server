import { Types } from 'mongoose'

import OrderServiceStatus from '../enums/OrderServiceStatus'
import RequestBuyStatus from '../enums/RequestBuyStatus'
import { IBuy } from '../models/Buy'
import BuyRepository from '../repositories/BuyRepository'
import ServiceOrderRepository from '../repositories/ServiceOrderRepository'
import BaseService from './BaseService'
import ProductService from './ProductService'

export default class BuyService extends BaseService<IBuy> {
  private productService: ProductService
  private serviceOrderRepository: ServiceOrderRepository

  constructor () {
    super(new BuyRepository())
    this.productService = new ProductService()
    this.serviceOrderRepository = new ServiceOrderRepository()
  }

  async createBuy (data: IBuy) {
    if (data.serviceOrderId) {
      const serviceOrder = await this.serviceOrderRepository.findById(data.serviceOrderId)
      if (serviceOrder) {
        serviceOrder.status = OrderServiceStatus.PENDING_PRODUCT
        await serviceOrder.save()
      } else {
        throw new Error('ID da ordem de serviço não encontrado')
      }
    }

    const buy = await this.repository.create(data)

    return buy
  }

  async updateBuy (id: Types.ObjectId, data: Partial<IBuy>) {
    const buy = await this.repository.findById(id)
    if (!buy) throw new Error('Solicitação de compra não encontrada')

    const previousStatus = buy.status
    Object.assign(buy, data)
    await this.repository.update(id, buy)

    let serviceOrder = null
    if (buy.serviceOrderId) {
      serviceOrder = await this.serviceOrderRepository.findById(buy.serviceOrderId)
      if (!serviceOrder) throw new Error('ID da ordem de serviço não encontrado')
    }

    // Quando a compra é entregue
    if (previousStatus !== RequestBuyStatus.DELIVERED &&
      buy.status === RequestBuyStatus.DELIVERED) {
      for (const item of buy.products) {
        const product = await this.productService.findById(item.productId)
        if (!product) continue

        // Incrementa estoque da compra
        product.quantity += item.quantity

        // Se houver OS vinculada, retira do estoque o necessário
        if (serviceOrder) {
          const serviceOrderItem = serviceOrder.products?.find(p =>
            p.productId.equals(item.productId)
          )

          if (serviceOrderItem) {
            const neededQuantity = serviceOrderItem.quantity
            const quantityForOS = Math.min(item.quantity, neededQuantity)
            product.quantity -= quantityForOS
          }
        }

        await product.save()
      }

      // Atualiza status da OS se existir
      if (serviceOrder && serviceOrder.status !== OrderServiceStatus.CANCELED) {
        serviceOrder.status = OrderServiceStatus.PENDING
        await serviceOrder.save()
      }
    }
    // Status PENDING ou APPROVED → OS fica em PENDING_PRODUCT
    else if (
      buy.status === RequestBuyStatus.PENDING ||
    buy.status === RequestBuyStatus.APPROVED
    ) {
      if (serviceOrder && serviceOrder.status !== OrderServiceStatus.CANCELED) {
        serviceOrder.status = OrderServiceStatus.PENDING_PRODUCT
        await serviceOrder.save()
      }
    }

    return buy
  }

  async authorize (id: Types.ObjectId, authorization: boolean) {
    const buy = await this.repository.findById(id)
    if (!buy) throw new Error('Solicitação de compra não encontrada')

    if (authorization) {
      buy.authorized = true
      buy.status = RequestBuyStatus.APPROVED
    } else {
      buy.authorized = false
      buy.status = RequestBuyStatus.REJECTED
    }
    await this.repository.update(id, buy)

    return buy
  }
}
