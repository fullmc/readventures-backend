import { Router, Response } from "express";
import { signupUser, loginUser } from "../controllers/user.controller";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";
import { getMe } from "../controllers/user.controller";
import passport from "../config/passport";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";


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

router.patch("/theme", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { theme } = req.body;

    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validation du thème
    if (!theme || (theme !== "light" && theme !== "dark")) {
      return res.status(400).json({ 
        error: "Invalid theme. Theme must be 'light' or 'dark'" 
      });
    }

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { theme },
    });

    return res.json({ 
      success: true, 
      theme: updated.theme,
      message: "Theme updated successfully"
    });
  } catch (error) {
    console.error("Error updating theme:", error);
    return res.status(500).json({ error: "Failed to update theme" });
  }
});




export default router;
