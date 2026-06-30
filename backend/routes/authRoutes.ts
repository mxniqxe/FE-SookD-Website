import { Router } from "express";

import { login,register,getAllUsers,logout, getLoginUser }from "../controllers/authController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/login",login);
router.post("/register", register);
router.get( "/users", getAllUsers);
router.post( "/logout", logout);
router.get( "/me", verifyToken,getLoginUser); //ใช้เช็คว่าที่loginตอนนี้เป็นใคร

export default router;