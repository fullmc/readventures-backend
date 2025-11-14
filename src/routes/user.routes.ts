import { Router } from "express";
import { signupUser, loginUser } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { getMe } from "../controllers/user.controller";


const router = Router();

// POST /signup
router.post("/signup", signupUser);

// POST /login
router.post("/login", loginUser);

// GET authentified user
router.get("/me", authMiddleware, getMe);


export default router;
