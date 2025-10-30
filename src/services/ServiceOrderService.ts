import fs from 'fs'
import { Types } from 'mongoose'
import path from 'path'
import puppeteer from 'puppeteer'

import OrderServiceStatus from '../enums/OrderServiceStatus'
import Role from '../enums/Role'
import { IClient } from '../models/Client'
import { IServiceOrder } from '../models/ServiceOrder'
import User from '../models/User'
import { IVehicle } from '../models/Vehicle'
import { scheduleOrderDeadlineJob } from '../queues/OrderDeadlineQueue'
import ServiceOrderRepository from '../repositories/ServiceOrderRepository'
import Time from '../utils/Time'
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

    const serviceOrderCode = await this.serviceOrderRepository.getNextSequence('serviceOrderCode')

    data.code = `OS-${serviceOrderCode}`

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

  async configureOrderDeadlineJob (hour: number, minute: number) {
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      throw new Error('Hora ou minuto inválido')
    }

    const userEmails = await User.find({
      $or: [
        { role: Role.ADMIN },
        { role: Role.EMPLOYER, manager: true }
      ]
    }).select('email')
      .lean()
      .then(users => users.map(u => u.email).filter(email => email))

    if (userEmails.length === 0) {
      throw new Error('Email do usuário é obrigatório')
    }

    scheduleOrderDeadlineJob(hour, minute, userEmails)
  }

  async checkServiceOrdersNearDeadline () {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)

    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0))
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999))

    const ordersDueTomorrow = await this.serviceOrderRepository.aggregateMany([
      {
        $match: {
          deadline: { $gte: startOfTomorrow, $lte: endOfTomorrow },
          status: {
            $nin: [
              OrderServiceStatus.COMPLETED,
              OrderServiceStatus.CANCELED
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $unwind: { path: '$client', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicle'
        }
      },
      {
        $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          code: 1,
          deadline: 1,
          client: '$client.name',
          vehicle: '$vehicle.name'
        }
      }
    ])

    return ordersDueTomorrow
  }

  async checkServiceOrdersPastDeadline () {
    const now = new Date()

    const overdueOrders = await this.serviceOrderRepository.aggregateMany([
      {
        $match: {
          deadline: { $lt: now },
          status: {
            $nin: [
              OrderServiceStatus.COMPLETED,
              OrderServiceStatus.CANCELED
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $unwind: { path: '$client', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicle'
        }
      },
      {
        $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          code: 1,
          deadline: 1,
          client: '$client.name',
          vehicle: '$vehicle.name'
        }
      }
    ])

    return overdueOrders
  }

  async generateServiceOrderPDF (id: Types.ObjectId): Promise<any> {
    const serviceOrder = await this.serviceOrderRepository.findById(id)
      .populate('clientId')
      .populate('vehicleId')
      .lean()

    if (!serviceOrder) {
      throw new Error('Ordem de serviço não encontrada')
    }

    const client = serviceOrder.clientId as IClient
    const vehicle = serviceOrder.vehicleId as IVehicle

    const statusTranslated = {
      [OrderServiceStatus.REQUEST]: 'Solicitação',
      [OrderServiceStatus.PENDING_PRODUCT]: 'Pendente de Produto',
      [OrderServiceStatus.BUDGET]: 'Orçamento',
      [OrderServiceStatus.IN_PROGRESS]: 'Em Progresso',
      [OrderServiceStatus.COMPLETED]: 'Concluída',
      [OrderServiceStatus.CANCELED]: 'Cancelada'
    }

    // ====== Logo ======
    const logoPath = path.resolve('src/utils/logoDoOs.png')
    const logoBase64 = fs.existsSync(logoPath)
      ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
      : ''

    // ====== HTML ======
    const html = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 25px;
        color: #333;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #4a90e2;
        padding-bottom: 8px;
        margin-bottom: 25px;
      }
      .header img {
        width: 100px;
      }
      .header .info {
        text-align: right;
        font-size: 12px;
      }

      h2 {
        font-size: 14px;
        font-weight: bold;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 6px;
        color: #333;
      }

      .card {
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 12px 18px;
        margin-bottom: 18px;
        background: #f8f9fb;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 10px 20px;
        margin-top: 10px;
      }

      .field {
        display: flex;
        flex-direction: column;
      }
      .field label {
        font-size: 11px;
        color: #555;
        margin-bottom: 3px;
      }
      .field-value {
        border: 1px solid #ccc;
        border-radius: 4px;
        background: #fff;
        padding: 4px 6px;
        font-size: 12px;
      }

      .section {
        margin-top: 18px;
      }

      .bullet {
        margin-left: 15px;
        font-size: 12px;
      }

      .inline {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      ${logoBase64 ? `<img src="${logoBase64}" />` : ''}
      <div class="info">
        <div><strong>Oficina Mecânica XPTO</strong></div>
        <div>Rua dos Mecânicos, 123</div>
        <div>contato@xptooficina.com</div>
      </div>
    </div>

    <!-- DADOS DA OS -->
    <div class="card">
      <h2>📄 Dados da OS</h2>
      <div class="grid">
        <div class="field">
          <label>Código da OS</label>
          <div class="field-value">${serviceOrder.code}</div>
        </div>
        <div class="field">
          <label>Status</label>
          <div class="field-value">${statusTranslated[serviceOrder.status]}</div>
        </div>
        <div class="field">
          <label>Entrada do veículo</label>
          <div class="field-value">${Time.formatDateToBR(serviceOrder.entryDate)}</div>
        </div>
        <div class="field">
          <label>Previsão de entrega</label>
          <div class="field-value">${Time.formatDateToBR(serviceOrder.deadline)}</div>
        </div>
      </div>
    </div>

    <!-- CLIENTE -->
    <div class="card">
      <h2>👤 Cliente</h2>
      ${
  client
    ? `
      <div class="grid">
        <div class="field">
          <label>Nome / Razão Social</label>
          <div class="field-value">${client.name}</div>
        </div>
        <div class="field">
          <label>CPF / CNPJ</label>
          <div class="field-value">${client.cpf ?? client.cnpj ?? '-'}</div>
        </div>
        <div class="field">
          <label>Telefone</label>
          <div class="field-value">${client.cellphone}</div>
        </div>
        <div class="field">
          <label>Email</label>
          <div class="field-value">${client.email}</div>
        </div>
        <div class="field">
          <label>Endereço</label>
          <div class="field-value">${client.address}</div>
        </div>
      </div>`
    : '<p>-</p>'
}
    </div>

    <!-- VEÍCULO -->
    <div class="card">
      <h2>🚗 Dados do Veículo</h2>
      ${
  vehicle
    ? `
      <div class="grid">
        <div class="field">
          <label>Placa</label>
          <div class="field-value">${vehicle.licensePlate}</div>
        </div>
        <div class="field">
          <label>Marca</label>
          <div class="field-value">${vehicle.brand}</div>
        </div>
        <div class="field">
          <label>Modelo</label>
          <div class="field-value">${vehicle.name}</div>
        </div>
        <div class="field">
          <label>Ano</label>
          <div class="field-value">${vehicle.year}</div>
        </div>
        <div class="field">
          <label>Tipo de Combustível</label>
          <div class="field-value">${vehicle.fuel}</div>
        </div>
        <div class="field">
          <label>Chassi</label>
          <div class="field-value">${vehicle.chassi ?? '-'}</div>
        </div>
        <div class="field">
          <label>KM</label>
          <div class="field-value">${vehicle.km ?? '-'}</div>
        </div>
      </div>`
    : '<p>-</p>'
}
    </div>

    <!-- SOLICITAÇÃO -->
    <div class="card">
      <h2>📝 Solicitação do Cliente</h2>
      <p>${serviceOrder.descriptionClient ?? '-'}</p>
    </div>

    <!-- ANÁLISE -->
    <div class="card">
      <h2>🔧 Análise / Diagnóstico</h2>
      <p>${serviceOrder.technicalAnalysis ?? '-'}</p>
    </div>

    <!-- SERVIÇOS -->
    <div class="card">
      <h2>🧰 Serviços</h2>
      ${
  serviceOrder.services?.length
    ? serviceOrder.services
      .map(
        (s) =>
          `<p class="bullet">• ${s.title} — ${s.workHours}h | Qtd: ${s.quantity} | Valor/h: R$${s.hourValue} | Total: R$${s.totalValue}</p>`
      )
      .join('')
    : '<p>Nenhum serviço registrado.</p>'
}
    </div>

    <!-- PRODUTOS -->
    <div class="card">
      <h2>📦 Produtos</h2>
      ${
  serviceOrder.products?.length
    ? serviceOrder.products
      .map(
        (p) =>
          `<p class="bullet">• ${p.name} — Qtd: ${p.quantity} | Unit: R$${p.salePrice ?? 0}</p>`
      )
      .join('')
    : '<p>Nenhum produto registrado.</p>'
}
    </div>

    <!-- DESCONTOS -->
    <div class="card">
      <h2>💰 Descontos</h2>
      ${
  serviceOrder.discountType
    ? `<p><b>Tipo:</b> ${serviceOrder.discountType}</p><p><b>Valor:</b> ${serviceOrder.discountValue}</p>`
    : '<p>Sem descontos aplicados.</p>'
}
    </div>

    <!-- OBSERVAÇÕES -->
    <div class="card">
      <h2>🗒️ Observações</h2>
      <p>${serviceOrder.notes ?? '-'}</p>
    </div>

    <!-- TOTAIS -->
    <div class="card">
      <h2>📊 Valores Totais</h2>
      <div class="grid">
        <div class="field">
          <label>Total Produtos</label>
          <div class="field-value">R$ ${serviceOrder.totalValueProducts?.toFixed(2) ?? 0}</div>
        </div>
        <div class="field">
          <label>Total Serviços</label>
          <div class="field-value">R$ ${serviceOrder.totalValueServices?.toFixed(2) ?? 0}</div>
        </div>
        <div class="field">
          <label>Total Geral</label>
          <div class="field-value">R$ ${serviceOrder.totalValueGeneral?.toFixed(2) ?? 0}</div>
        </div>
        ${
  serviceOrder.totalValueWithDiscount
    ? `<div class="field"><label>Total com Desconto</label><div class="field-value">R$ ${serviceOrder.totalValueWithDiscount.toFixed(2)}</div></div>`
    : ''
}
      </div>
    </div>
  </body>
</html>
`

    // ====== PDF ======
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()

    return pdfBuffer
  }

  private formatDate (date?: Date) {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }
}
