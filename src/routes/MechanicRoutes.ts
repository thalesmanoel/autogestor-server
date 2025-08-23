import { Router } from "express";
import MechanicController from "../controllers/auth/MechanicController";

const router = Router();
const mechanicController = new MechanicController();

router.post("/", mechanicController.create);
router.get("/", mechanicController.getAll);
router.get("/:id", mechanicController.getById);
router.put("/:id", mechanicController.update);
router.delete("/:id", mechanicController.delete);

export default router;
