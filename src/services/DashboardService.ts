import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'

import RequestBuyStatus from '../enums/RequestBuyStatus'
import { IDashboard } from '../models/Dashboard'
import { IServiceOrder } from '../models/ServiceOrder'
import BuyRepository from '../repositories/BuyRepository'
import ClientRepository from '../repositories/ClientRepository'
import DashboardRepository from '../repositories/DashboardRepository'
import ServiceOrderRepository from '../repositories/ServiceOrderRepository'
import BaseService from './BaseService'

export default class DashboardService extends BaseService<IDashboard> {
  private dashboardRepository: DashboardRepository
  private serviceOrderRepository: ServiceOrderRepository
  private buyRepository: BuyRepository
  private clientRepository: ClientRepository
  constructor () {
    super(new DashboardRepository())
    this.dashboardRepository = new DashboardRepository()
    this.serviceOrderRepository = new ServiceOrderRepository()
    this.buyRepository = new BuyRepository()
    this.clientRepository = new ClientRepository()
  }

  async getDashboardDatas (startDate?: Date, endDate?: Date) {
    const pipeline: any[] = []

    if (startDate && endDate) {
      pipeline.push({
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      })
    }

    const billingTotalValue = await this.getBillingServiceOrdersTotalValue(pipeline)
    const totalCost = await this.getCostRequestBuys(startDate, endDate)
    const grossProfit = billingTotalValue.totalGeneral - totalCost
    const quantityNewClients = await this.getQuantityNewClients(startDate, endDate)

    return {
      billingTotalValue,
      totalCost,
      grossProfit,
      quantityNewClients
    }
  }

  async getBillingServiceOrdersTotalValue (pipeline: any[]) {
    const result = await this.serviceOrderRepository.aggregateMany([
      ...pipeline,
      { $match: { paid: true } },
      {
        $project: {
          totalValueGeneral: 1,
          totalValueServices: 1,
          totalValueProducts: 1
        }
      },
      {
        $group: {
          _id: null,
          totalGeneral: { $sum: '$totalValueGeneral' },
          totalServices: { $sum: '$totalValueServices' },
          totalProducts: { $sum: '$totalValueProducts' },
          countOrders: { $sum: 1 }
        }
      }
    ])

    return result.length > 0
      ? {
        totalGeneral: result[0].totalGeneral,
        totalServices: result[0].totalServices,
        totalProducts: result[0].totalProducts,
        countOrders: result[0].countOrders
      }
      : { totalGeneral: 0, totalServices: 0, totalProducts: 0, countOrders: 0 }
  }

  async getCostRequestBuys (startDate?: Date, endDate?: Date): Promise<number> {
    const pipeline: any[] = []

    if (startDate && endDate) {
      pipeline.push({
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      })
    }

    const result = await this.buyRepository.aggregateMany([
      ...pipeline,
      {
        $match: {
          status: {
            $in: [
              RequestBuyStatus.DELIVERED,
              RequestBuyStatus.PURCHASED
            ]
          }
        }
      },
      { $unwind: '$products' },
      {
        $project: {
          cost: { $multiply: ['$products.costUnitPrice', '$products.totalQuantity'] }
        }
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' }
        }
      }
    ])

    return result.length > 0 ? result[0].totalCost : 0
  }

  async getQuantityNewClients (startDate?: Date, endDate?: Date) {
    const pipeline: any[] = []

    if (startDate && endDate) {
      pipeline.push({
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      })
    }

    pipeline.push({ $count: 'quantityNewClients' })

    const result = await this.clientRepository.aggregateMany(pipeline)
    return result.length > 0 ? result[0].quantityNewClients : 0
  }

  async incrementMonthlyDashboard (order: IServiceOrder) {
    if (!order.paid || !order.paymentDate) return

    const year = order.paymentDate.getFullYear()
    const month = order.paymentDate.getMonth() + 1

    await this.dashboardRepository.updateWithOperators(
      { year, month },
      {
        $inc: { billingTotalValue: order.totalValueGeneral || 0 },
        $setOnInsert: { year, month }
      },
      true
    )
  }

  async getLastMonthsBilling (year?: number) {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const matchStage: any = {}

    if (year) {
      matchStage.year = year
    } else {
      matchStage.year = { $gte: start.getFullYear() }
      matchStage.$expr = {
        $gte: [
          { $dateFromParts: { year: '$year', month: '$month', day: 1 } },
          start
        ]
      }
    }

    const result = await this.dashboardRepository.aggregateMany([
      { $match: matchStage },
      {
        $project: {
          _id: 0,
          year: 1,
          month: 1,
          totalBilling: '$billingTotalValue'
        }
      },
      { $sort: { year: 1, month: 1 } }
    ])

    return result
  }

  async generateDashboardPDF (startDate?: Date, endDate?: Date): Promise<Buffer> {
    const dashboardData = await this.getDashboardDatas(startDate, endDate)
    const { billingTotalValue, totalCost, grossProfit, quantityNewClients } = dashboardData

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

      h1 {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #333;
      }

      h2 {
        font-size: 14px;
        font-weight: bold;
        margin: 0 0 10px 0;
        color: #333;
      }

      .card {
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 14px 20px;
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

      .summary {
        font-size: 13px;
        margin-top: 8px;
      }

      .total {
        font-weight: bold;
        font-size: 13px;
        color: #2c3e50;
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

    <h1>📊 Relatório do Dashboard</h1>
    <p>Período: <strong>${this.formatDate(startDate)} a ${this.formatDate(endDate)}</strong></p>

    <!-- FATURAMENTO -->
    <div class="card">
      <h2>💵 Faturamento</h2>
      <div class="grid">
        <div class="field">
          <label>Total Geral</label>
          <div class="field-value">R$ ${billingTotalValue.totalGeneral.toFixed(2)}</div>
        </div>
        <div class="field">
          <label>Total Serviços</label>
          <div class="field-value">R$ ${billingTotalValue.totalServices.toFixed(2)}</div>
        </div>
        <div class="field">
          <label>Total Produtos</label>
          <div class="field-value">R$ ${billingTotalValue.totalProducts.toFixed(2)}</div>
        </div>
        <div class="field">
          <label>Quantidade de Ordens</label>
          <div class="field-value">${billingTotalValue.countOrders}</div>
        </div>
      </div>
    </div>

    <!-- CUSTOS -->
    <div class="card">
      <h2>💰 Custos Operacionais</h2>
      <div class="grid">
        <div class="field">
          <label>Total de Custos</label>
          <div class="field-value">R$ ${totalCost.toFixed(2)}</div>
        </div>
      </div>
    </div>

    <!-- LUCRO -->
    <div class="card">
      <h2>📈 Lucro Bruto</h2>
      <div class="grid">
        <div class="field">
          <label>Lucro Bruto</label>
          <div class="field-value total">R$ ${grossProfit.toFixed(2)}</div>
        </div>
      </div>
    </div>

    <!-- NOVOS CLIENTES -->
    <div class="card">
      <h2>👥 Novos Clientes</h2>
      <div class="grid">
        <div class="field">
          <label>Quantidade</label>
          <div class="field-value">${quantityNewClients}</div>
        </div>
      </div>
    </div>

  </body>
</html>
`

    // ====== PDF ======
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfUint8Array = await page.pdf({ format: 'A4', printBackground: true })
    const pdfBuffer = Buffer.from(pdfUint8Array)
    await browser.close()

    return pdfBuffer
  }

  private formatDate (date?: Date) {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }
}
