import { Router } from "express";
import { signupUser, loginUser, getMe, updateTheme } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import passport from "../config/passport";
import jwt from "jsonwebtoken";


const router = Router();
const frontend = process.env.FRONTEND_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined. Please set it in the environment.");
}


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
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // redirect to frontend with token 
    res.redirect(`${frontend}?token=${token}`);
  }
);

router.patch("/theme", authMiddleware, updateTheme);


export default router;
