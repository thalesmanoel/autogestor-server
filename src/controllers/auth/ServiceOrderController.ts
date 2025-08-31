import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import ServiceOrderService from '../../services/ServiceOrderService';

export default class ServiceOrderController {
  private serviceOrderService: ServiceOrderService;

  constructor() {
    this.serviceOrderService = new ServiceOrderService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceOrder = await this.serviceOrderService.createServiceOrder(req.body);
      res.status(201).json(serviceOrder);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceOrders = await this.serviceOrderService.findAll();
      res.json(serviceOrders);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceOrder = await this.serviceOrderService.findById(new Types.ObjectId(req.params.id));
      if (!serviceOrder) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(serviceOrder);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const serviceOrder = await this.serviceOrderService.updateServiceOrder(new Types.ObjectId(id), data);
      if (!serviceOrder) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(serviceOrder);
    } catch (error) {
      next(error);
    }
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const serviceOrder = await this.serviceOrderService.changeStatus(new Types.ObjectId(id), status);

      if (!serviceOrder)
        return res.status(404).json({ message: "Ordem de serviço não encontrada" });
      res.status(200).json(serviceOrder);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceOrder = await this.serviceOrderService.delete(new Types.ObjectId(req.params.id));
      if (!serviceOrder) return res.status(404).json({ message: "Produto não encontrado" });
      res.json({ message: "Produto deletado com sucesso" });
    } catch (error) {
      next(error);
    }
  };

  exportPdf = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.serviceOrderService.exportPdf(new Types.ObjectId(id), res);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
