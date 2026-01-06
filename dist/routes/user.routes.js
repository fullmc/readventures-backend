"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const passport_1 = __importDefault(require("../config/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const frontend = process.env.FRONTEND_URL;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined. Please set it in the environment.");
}
// POST /signup
router.post("/signup", user_controller_1.signupUser);
// POST /login
router.post("/", user_controller_1.loginUser);
// GET authentified user
router.get("/me", authMiddleware_1.authMiddleware, user_controller_1.getMe);
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { session: false }), (req, res) => {
    const user = req.user;
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    // redirect to frontend with token 
    res.redirect(`${frontend}?token=${token}`);
});
router.patch("/theme", authMiddleware_1.authMiddleware, user_controller_1.updateTheme);
exports.default = router;
