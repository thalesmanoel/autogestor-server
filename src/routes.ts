import { Router } from "express";
import { authMiddleware } from "./middlewares/AuthMiddleware";

import unauthRoutes from "./routes/UnauthRoutes";
import authRoutes from "./routes/AuthRoutes";

const router = Router();

router.use("/unauth", unauthRoutes);
router.use("/auth", authMiddleware, authRoutes);

export default router;
