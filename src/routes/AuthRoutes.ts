import { Router } from "express";
import UserRoutes from "./UserRoutes"

const router = Router();

router.use("/users", UserRoutes);

export default router;
