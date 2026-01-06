"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTheme = exports.getMe = exports.loginUser = exports.signupUser = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signupUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        // Check if user exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user
        const newUser = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
        // Token generated
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                theme: newUser.theme,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.signupUser = signupUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user || !user.password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // create token
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                theme: user.theme
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.loginUser = loginUser;
const getMe = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            theme: user.theme,
        });
    }
    catch (error) {
        console.error("Error in getMe:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getMe = getMe;
const updateTheme = async (req, res) => {
    try {
        const { theme } = req.body;
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!theme || (theme !== "light" && theme !== "dark")) {
            return res.status(400).json({
                message: "Invalid theme. Theme must be 'light' or 'dark'",
            });
        }
        const updated = await prisma_1.default.user.update({
            where: { id: req.userId },
            data: { theme },
        });
        return res.json({
            success: true,
            theme: updated.theme,
            message: "Theme updated successfully",
        });
    }
    catch (error) {
        console.error("Error updating theme:", error);
        return res.status(500).json({ message: "Failed to update theme" });
    }
};
exports.updateTheme = updateTheme;
