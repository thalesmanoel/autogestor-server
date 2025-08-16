import { Request, Response, NextFunction } from "express";
import BuyService from "../../services/BuyService";

export default class BuyController {
  private buyService: BuyService;

  constructor() {
    this.buyService = new BuyService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buy = await this.buyService.create(req.body);
      res.status(201).json(buy);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const buys = await this.buyService.findAll();
      res.json(buys);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buy = await this.buyService.findById(req.params.id);
      if (!buy) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(buy);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const buy = await this.buyService.update(id, data);
      if (!buy) return res.status(404).json({ message: "Produto não encontrado" });
      res.json(buy);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buy = await this.buyService.delete(req.params.id);
      if (!buy) return res.status(404).json({ message: "Produto não encontrado" });
      res.json({ message: "Produto deletado com sucesso" });
    } catch (error) {
      next(error);
    }
  };
}
