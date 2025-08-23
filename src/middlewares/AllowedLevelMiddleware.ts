import { NextFunction, Request, Response } from "express";
import Role from "../enums/Role";

const AllowedRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!allowedRoles.includes(userRole as Role)) {
      return res.status(403).json({ message: "Usuário não autorizado" });
    }

    next();
  };
};

export default AllowedRoles;
