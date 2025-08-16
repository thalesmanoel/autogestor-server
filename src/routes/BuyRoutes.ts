import { Router } from "express";
import BuyController from "../controllers/auth/BuyController";

const router = Router();
const buyController = new BuyController();

router.post("/", buyController.create);
router.get("/", buyController.getAll);
router.get("/:id", buyController.getById);
router.put("/:id", buyController.update);
router.delete("/:id", buyController.delete);

export default router;
