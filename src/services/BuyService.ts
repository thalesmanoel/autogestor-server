import { Types } from 'mongoose'

import OrderServiceStatus from '../enums/OrderServiceStatus'
import RequestBuyStatus from '../enums/RequestBuyStatus'
import { IBuy } from '../models/Buy'
import BuyRepository from '../repositories/BuyRepository'
import ServiceOrderRepository from '../repositories/ServiceOrderRepository'
import BaseService from './BaseService'
import ProductService from './ProductService'
import ServiceOrderService from './ServiceOrderService'

export default class BuyService extends BaseService<IBuy> {
  private productService: ProductService
  private buyRepository: BuyRepository
  private serviceOrderRepository: ServiceOrderRepository

  constructor () {
    super(new BuyRepository())
    this.productService = new ProductService()
    this.serviceOrderRepository = new ServiceOrderRepository()
    this.buyRepository = new BuyRepository()
  }

  async createBuy (data: IBuy) {
    let serviceOrder = null

    // Atualiza status da OS se houver
    if (data.serviceOrderId) {
      serviceOrder = await this.serviceOrderRepository.findById(data.serviceOrderId)
      if (!serviceOrder) throw new Error('ID da ordem de serviço não encontrado')
      serviceOrder.status = OrderServiceStatus.PENDING_PRODUCT
      await serviceOrder.save()
    }

    for (const item of data.products) {
      let product = item.productId
        ? await this.productService.findById(item.productId)
        : null

      if (!product) {
        // Produto não existe → cria com estoque zero
        product = await this.productService.createProduct({
          name: item.name,
          costUnitPrice: item.costUnitPrice,
          salePrice: item.salePrice,
          grossProfitMargin: item.grossProfitMargin,
          providerIds: item.providerIds,
          quantity: 0
        })
      } else {
        // Atualiza os dados dos produtos caso já existam
        if (item.costUnitPrice !== undefined) product.costUnitPrice = item.costUnitPrice
        if (item.salePrice !== undefined) product.salePrice = item.salePrice
        if (item.grossProfitMargin !== undefined) product.grossProfitMargin = item.grossProfitMargin

        if (item.providerIds?.length) {
          product.providerIds = Array.from(
            new Set([...(product.providerIds ?? []), ...item.providerIds])
          )
        }

        await product.save()
      }

      // 🔑 Atualiza o item para garantir que terá o productId
      item.productId = product._id as Types.ObjectId
      item.code = product.code
      item.costUnitPrice = product.costUnitPrice
      item.salePrice = product.salePrice
      item.grossProfitMargin = product.grossProfitMargin

      // Atualiza OS se houver
      if (serviceOrder) {
        const serviceOrderItem = serviceOrder.products?.find(p => p.name === item.name)
        if (serviceOrderItem) {
          serviceOrderItem.productId = product._id as Types.ObjectId
          serviceOrderItem.code = product.code
          serviceOrderItem.costUnitPrice = product.costUnitPrice
          serviceOrderItem.grossProfitMargin = product.grossProfitMargin
          serviceOrderItem.salePrice = product.salePrice
        }
      }
    }

    // Salva a OS apenas uma vez após atualizar todos os produtos
    if (serviceOrder) {
      const totals = await new ServiceOrderService().calculateTotals(serviceOrder)
      Object.assign(serviceOrder, totals)
      await serviceOrder.save()
    }

    const buy = await this.buyRepository.create(data)
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

        const previousStock = product.quantity

        // Adiciona ao estoque a quantidade entregue
        product.quantity += item.quantity

        // Se houver OS vinculada, retira do estoque o necessário
        if (serviceOrder) {
          const serviceOrderItem = serviceOrder.products?.find(p =>
            p.productId.equals(item.productId)
          )

          if (serviceOrderItem) {
          // Quantidade que realmente falta para atender a OS
            const quantityNeededForOS = Math.max(serviceOrderItem.quantity - previousStock, 0)
            // Só desconta o que realmente será usado da compra
            const quantityForOS = Math.min(item.quantity, quantityNeededForOS)

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
    const buy = await this.buyRepository.findById(id)
    if (!buy) throw new Error('Solicitação de compra não encontrada')

    if (authorization) {
      buy.authorized = true
      buy.status = RequestBuyStatus.APPROVED
    } else {
      buy.authorized = false
      buy.status = RequestBuyStatus.REJECTED
    }
    await this.buyRepository.update(id, buy)

    return buy
  }
}
