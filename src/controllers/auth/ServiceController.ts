import { Request, Response, NextFunction } from "express";
import ServiceListService from "../../services/ServiceListService";

export default class ServiceController {
  private serviceListService: ServiceListService;

  constructor() {
    this.serviceListService = new ServiceListService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = await this.serviceListService.create(req.body);
      res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const services = await this.serviceListService.findAll();
      res.json(services);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = await this.serviceListService.findById(req.params.id);
      if (!service) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(service);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const service = await this.serviceListService.update(id, data);
      if (!service) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(service);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = await this.serviceListService.delete(req.params.id);
      if (!service) return res.status(404).json({ message: "Produto não encontrado" });
      res.json({ message: "Produto deletado com sucesso" });
    } catch (error) {
      next(error);
    }
  };
}
