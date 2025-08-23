import { Router } from "express";
import ProviderController from "../controllers/auth/ProviderController";

const router = Router();
const providerController = new ProviderController();

router.post("/", providerController.create);
router.get("/", providerController.getAll);
router.get("/:id", providerController.getById);
router.put("/:id", providerController.update);
router.delete("/:id", providerController.delete);

export default router;
