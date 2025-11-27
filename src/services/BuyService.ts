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

    if (data.serviceOrderId) {
      serviceOrder = await this.serviceOrderRepository.findById(data.serviceOrderId)
      if (!serviceOrder) throw new Error('ID da ordem de serviço não encontrado')

      serviceOrder.status = OrderServiceStatus.PENDING_PRODUCT
      await serviceOrder.save()
    }

    const buy = await this.buyRepository.create(data)
    return buy
  }

  async updateBuy (id: Types.ObjectId, data: Partial<IBuy>) {
    const buy = await this.repository.findById(id)
    if (!buy) throw new Error('Solicitação de compra não encontrada')

    const previousStatus = buy.status
    if (data.products) {
      data.products = data.products.map((newItem) => {
        const oldItem = buy.products.find(
          p => String(p.productId) === String(newItem.productId)
        )

        return {
          ...newItem,
          observations: newItem.observations ?? oldItem?.observations ?? ''
        }
      })
    }
    Object.assign(buy, data)

    await buy.save()

    let serviceOrder = null
    if (buy.serviceOrderId) {
      serviceOrder = await this.serviceOrderRepository.findById(buy.serviceOrderId)
      if (!serviceOrder) throw new Error('ID da ordem de serviço não encontrado')
    }

    if (previousStatus !== RequestBuyStatus.DELIVERED &&
      buy.status === RequestBuyStatus.DELIVERED) {
      for (const item of buy.products) {
        let product = item.productId
          ? await this.productService.findById(item.productId as Types.ObjectId)
          : null

        if (!product) {
          product = await this.productService.createProduct({
            name: item.name,
            quantity: 0,
            costUnitPrice: item.costUnitPrice ?? 0,
            salePrice: item.salePrice,
            grossProfitMargin: item.grossProfitMargin,
            providerIds: item.providerIds
          })
        } else {
          if (item.costUnitPrice !== undefined) product.costUnitPrice = item.costUnitPrice
          if (item.salePrice !== undefined) product.salePrice = item.salePrice
          if (item.grossProfitMargin !== undefined) product.grossProfitMargin = item.grossProfitMargin
          if (item.providerIds?.length) {
            product.providerIds = Array.from(new Set([...(product.providerIds ?? []), ...item.providerIds]))
          }
        }

        if (product) {
          const addQty = item.quantityToStock ?? 0
          product.quantity += addQty
          await product.save()
        }

        if (serviceOrder && item.quantityToServiceOrder && item.quantityToServiceOrder > 0) {
          const existingItem = serviceOrder.products?.find(p => p.productId?.equals(product._id))
          if (existingItem) {
            existingItem.quantity = (existingItem.quantity ?? 0) + item.quantityToServiceOrder
          } else {
            serviceOrder.products?.push({
              productId: product._id,
              code: product.code,
              name: product.name,
              quantity: item.quantityToServiceOrder,
              costUnitPrice: product.costUnitPrice,
              salePrice: product.salePrice,
              grossProfitMargin: product.grossProfitMargin,
              providerIds: product.providerIds
            })
          }
        }
      }

      if (serviceOrder && serviceOrder.status !== OrderServiceStatus.CANCELED) {
        const totals = await new ServiceOrderService().calculateTotals(serviceOrder)
        Object.assign(serviceOrder, totals)
        serviceOrder.status = OrderServiceStatus.IN_PROGRESS
        await serviceOrder.save()
      }
    }

    return buy
  }

  async getProductHistory (productId: Types.ObjectId) {
    const pipeline: any[] = [
      { $match: { 'products.productId': productId } },
      { $unwind: '$products' },
      { $match: { 'products.productId': productId } },
      {
        $project: {
          _id: 0,
          requestDate: 1,
          deliveredDate: 1,
          quantity: '$products.totalQuantity',
          providerIds: '$products.providerIds',
          costUnitPrice: '$products.costUnitPrice',
          totalValue: { $multiply: ['$products.totalQuantity', '$products.costUnitPrice'] }
        }
      },
      { $sort: { requestDate: -1 } },
      { $limit: 10 }
    ]

    const history = await this.buyRepository.aggregateMany(pipeline)

    return history
  }

  async authorize (id: Types.ObjectId, authorization: boolean, changedAuthorizationByUser?: Types.ObjectId) {
    const buy = await this.buyRepository.findById(id)
    if (!buy) throw new Error('Solicitação de compra não encontrada')

    if (authorization) {
      buy.authorized = true
      buy.status = RequestBuyStatus.APPROVED
      buy.approvedBy = changedAuthorizationByUser
    } else {
      buy.authorized = false
      buy.status = RequestBuyStatus.REJECTED
      buy.rejectedBy = changedAuthorizationByUser
    }
    await this.buyRepository.update(id, buy)

    return buy
  }
}
