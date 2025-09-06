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

    const isChangingToDelivered =
    data.status === RequestBuyStatus.DELIVERED &&
    buy.status !== RequestBuyStatus.DELIVERED

    Object.assign(buy, data)
    await this.repository.update(id, buy)

    if (buy.serviceOrderId) {
      const serviceOrder = await this.serviceOrderRepository.findById(buy.serviceOrderId)
      if (serviceOrder) {
        if (isChangingToDelivered) {
          if (serviceOrder.status === OrderServiceStatus.CANCELED) {
          // Ordem cancelada -> adiciona produtos no estoque
            for (const item of buy.products) {
              const product = await this.productService.findById(item.productId)
              if (!product) continue

              product.quantity += item.quantity
              await product.save()
            }
          } else {
          // Ordem não cancelada -> muda status para PENDING
            serviceOrder.status = OrderServiceStatus.PENDING
            await serviceOrder.save()
          }
        } else if (
          data.status === RequestBuyStatus.PENDING ||
        data.status === RequestBuyStatus.APPROVED
        ) {
        // Enquanto não for delivered -> ordem fica em PENDING_PRODUCT
          if (serviceOrder.status !== OrderServiceStatus.CANCELED) {
            serviceOrder.status = OrderServiceStatus.PENDING_PRODUCT
            await serviceOrder.save()
          }
        }
      } else {
        throw new Error('ID da ordem de serviço não encontrado')
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
