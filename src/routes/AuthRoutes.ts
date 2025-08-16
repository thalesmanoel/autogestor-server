import { Router } from "express";
import UserRoutes from "./UserRoutes"
import ProductRoutes from "./ProductRoutes";
import ServiceRoutes from "./ServiceRoutes";

const router = Router();

router.use("/users", UserRoutes);
router.use("/products", ProductRoutes);
router.use("/services", ServiceRoutes);

export default router;
