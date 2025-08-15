import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../../models/User";
import Role from "../../enums/Role";

const SECRET = process.env.JWT_SECRET || "minha_chave_secreta";

export default class SigninController {
  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password, role } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || Role.EMPLOYER,
      });

      res.status(201).json({ message: "User created", user });
    } catch (err) {
      res.status(500).json({ error: "Error creating user" });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) return res.status(401).json({ message: "User not found" });

      const match = await bcrypt.compare(password, user.password);

      if (!match) return res.status(401).json({ message: "Invalid password" });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        SECRET,
        { expiresIn: "1d" }
      );

      res.json({ message: "Logged in", user, token });
    } catch (err) {
      res.status(500).json({ error: "Login error" });
    }
  };
}
