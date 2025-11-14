import { Router } from "express";
import { signupUser, loginUser } from "../controllers/user.controller";

const router = Router();

// POST /signup
router.post("/signup", signupUser);

// POST /login
router.post("/login", loginUser);

export default router;
