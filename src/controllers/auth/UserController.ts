import { Request, Response, NextFunction } from "express";
import UserService from "../../services/UserService";

export default class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.update(req.params.id, req.body);
      if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.delete(req.params.id);
      if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
      res.json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      next(error);
    }
  };
}
