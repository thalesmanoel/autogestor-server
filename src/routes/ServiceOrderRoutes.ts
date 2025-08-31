import { Router } from "express";
import ServiceOrderController from "../controllers/auth/ServiceOrderController";

const router = Router();
const serviceOrderController = new ServiceOrderController();

router.post("/", serviceOrderController.create);
router.get("/", serviceOrderController.getAll);
router.get("/:id", serviceOrderController.getById);
router.put("/:id", serviceOrderController.update);
router.delete("/:id", serviceOrderController.delete);

router.post("/export-pdf/:id", serviceOrderController.exportPdf);

export default router;
