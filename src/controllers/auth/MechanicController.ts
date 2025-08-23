import { Request, Response, NextFunction } from "express";
import MechanicService from "../../services/MechanicService";
import { Types } from "mongoose";

export default class MechanicController {
  private mechanicService: MechanicService;

  constructor() {
    this.mechanicService = new MechanicService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mechanic = await this.mechanicService.create(req.body);
      res.status(201).json(mechanic);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const mechanics = await this.mechanicService.findAll();
      res.json(mechanics);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mechanic = await this.mechanicService.findById(new Types.ObjectId(req.params.id));
      if (!mechanic) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(mechanic);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const mechanic = await this.mechanicService.update(new Types.ObjectId(id), data);
      if (!mechanic) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(mechanic);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mechanic = await this.mechanicService.delete(new Types.ObjectId(req.params.id));
      if (!mechanic) return res.status(404).json({ message: "Produto não encontrado" });
      res.json({ message: "Produto deletado com sucesso" });
    } catch (error) {
      next(error);
    }
  };
}
