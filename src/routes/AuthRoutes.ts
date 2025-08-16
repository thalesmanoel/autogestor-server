import { Router } from "express";
import UserRoutes from "./UserRoutes"
import ProductRoutes from "./ProductRoutes";
import ServiceRoutes from "./ServiceRoutes";
import VehicleRoutes from "./VehicleRoutes";

const router = Router();

router.use("/users", UserRoutes);
router.use("/products", ProductRoutes);
router.use("/services", ServiceRoutes);
router.use("/vehicles", VehicleRoutes);

export default router;
