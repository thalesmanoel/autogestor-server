import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface IJwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

const SECRET = process.env.JWT_SECRET || "minha_chave_secreta";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded as IJwtPayload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}
