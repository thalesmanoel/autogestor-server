import { Router } from "express";
import BuyController from "../controllers/auth/BuyController";
import AllowedRoles from "../middlewares/AllowedLevelMiddleware";
import Role from "../enums/Role";

const router = Router();
const buyController = new BuyController();

router.post("/", buyController.create);
router.get("/", buyController.getAll);
router.get("/:id", buyController.getById);
router.put("/:id", buyController.update);
router.delete("/:id", buyController.delete);

router.post("/authorize/:id", AllowedRoles(Role.ADMIN), buyController.authorize);

export default router;
