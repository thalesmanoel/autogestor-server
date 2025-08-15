import { Router } from "express";
import SigninController from "../controllers/unauth/SigninController";

const router = Router();
const signinController = new SigninController();

router.post("/login", signinController.login);
router.post("/register", signinController.register);

export default router;
