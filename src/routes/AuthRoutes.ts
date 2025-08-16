import { Router } from "express";
import UserRoutes from "./UserRoutes"
import ProductRoutes from "./ProductRoutes";

const router = Router();

router.use("/users", UserRoutes);
router.use("/products", ProductRoutes);

export default router;
