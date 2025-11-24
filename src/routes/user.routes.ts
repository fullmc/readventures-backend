import { Router } from "express";
import { signupUser, loginUser } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { getMe } from "../controllers/user.controller";
import passport from "../config/passport";
import jwt from "jsonwebtoken";


const router = Router();

// POST /signup
router.post("/signup", signupUser);

// POST /login
router.post("/", loginUser);

// GET authentified user
router.get("/me", authMiddleware, getMe);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req: any, res) => {
    const user = req.user;

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // redirect to frontend with token 
    res.redirect(`http://localhost:5173?token=${token}`);
  }
);


export default router;
