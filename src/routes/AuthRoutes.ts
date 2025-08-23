import { Router } from "express";
import UserRoutes from "./UserRoutes"
import ProductRoutes from "./ProductRoutes";
import ServiceRoutes from "./ServiceRoutes";
import VehicleRoutes from "./VehicleRoutes";
import ClientRoutes from "./ClientRoutes";
import BuyRoutes from "./BuyRoutes";
import MechanicRoutes from './MechanicRoutes';
import ServiceOrderRoutes from './ServiceOrderRoutes';
import ProviderRoutes from './ProviderRoutes';

const router = Router();

router.use("/users", UserRoutes);
router.use("/products", ProductRoutes);
router.use("/services", ServiceRoutes);
router.use("/vehicles", VehicleRoutes);
router.use("/clients", ClientRoutes);
router.use("/buys", BuyRoutes);
router.use('/mechanics', MechanicRoutes)
router.use('/service-orders', ServiceOrderRoutes)
router.use('/providers', ProviderRoutes)

export default router;
