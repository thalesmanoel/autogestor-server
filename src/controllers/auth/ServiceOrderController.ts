import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'

import { stopOrderDeadlineJob } from '../../queues/OrderDeadlineQueue'
import ServiceOrderService from '../../services/ServiceOrderService'

export default class ServiceOrderController {
  private serviceOrderService: ServiceOrderService

  constructor () {
    this.serviceOrderService = new ServiceOrderService()
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceOrder = await this.serviceOrderService.createServiceOrder(req.body)
      res.status(201).json(serviceOrder)
    } catch (error) {
      next(error)
    }
  }

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceOrders = await this.serviceOrderService.findAll()
      res.json(serviceOrders)
    } catch (error) {
      next(error)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceOrder = await this.serviceOrderService.findById(new Types.ObjectId(req.params.id))
      if (!serviceOrder) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(serviceOrder)
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const data = req.body

      const serviceOrder = await this.serviceOrderService.updateServiceOrder(new Types.ObjectId(id), data)
      if (!serviceOrder) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json(serviceOrder)
    } catch (error) {
      next(error)
    }
  }

  updatePaidStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { paid, paymentType } = req.body

      await this.serviceOrderService.updatePaidStatus(new Types.ObjectId(id), paid, paymentType)
      res.status(200).json({ message: 'Status de pagamento atualizado com sucesso' })
    } catch (error) {
      next(error)
    }
  }

  calculateTotalServiceOrderValue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { services, products, discountType, discountValue } = req.body

      const data = { services, products, discountType, discountValue }

      const totalValue = await this.serviceOrderService.calculateTotals(data)
      res.status(200).json({ totalValue })
    } catch (error) {
      next(error)
    }
  }

  changeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { status } = req.body

      const serviceOrder = await this.serviceOrderService.changeStatus(new Types.ObjectId(id), status)

      if (!serviceOrder) { return res.status(404).json({ message: 'Ordem de serviço não encontrada' }) }
      res.status(200).json(serviceOrder)
    } catch (error) {
      next(error)
    }
  }

  scheduleTimeReportEmailSender = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hour, minute } = req.body

      if (hour == null || minute == null) {
        return res.status(400).json({ message: 'Hora e minuto são obrigatórios' })
      }

      await this.serviceOrderService.configureOrderDeadlineJob(hour, minute)

      res.status(200).json({
        message: `Cron job configurado para rodar às ${hour}:${minute}`
      })
    } catch (error) {
      next(error)
    }
  }

  stopTimeReportEmailSender = async (req: Request, res: Response, next: NextFunction) => {
    try {
      stopOrderDeadlineJob()
      res.status(200).json({ message: 'Disparo de relatório para email pausado com sucesso' })
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceOrder = await this.serviceOrderService.delete(new Types.ObjectId(req.params.id))
      if (!serviceOrder) return res.status(404).json({ message: 'Produto não encontrado' })
      res.json({ message: 'Produto deletado com sucesso' })
    } catch (error) {
      next(error)
    }
  }

  exportServiceOrderAsPDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const pdfBuffer = await this.serviceOrderService.generateServiceOrderPDF(new Types.ObjectId(id))

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename=ordem-servico-${id}.pdf`)
      res.send(pdfBuffer)
    } catch (error: any) {
      next(error)
    }
  }
}
