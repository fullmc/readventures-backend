import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/authMiddleware";
import crypto from "crypto";
import sendEmail from "../utils/email";
import * as passwordService from "../services/password.service";


export const signupUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Token generated
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        theme: newUser.theme,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // create token
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        theme: user.theme
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
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
    
  } catch (error) {
    console.error("Error in getMe:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTheme = async (req: AuthRequest, res: Response) => {
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

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { theme },
    });

    return res.json({
      success: true,
      theme: updated.theme,
      message: "Theme updated successfully",
    });
  } catch (error) {
    console.error("Error updating theme:", error);
    return res.status(500).json({ message: "Failed to update theme" });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Do not reveal that the email does not exist
      return res.status(200).json({ message: "Email envoyé." });
    }

    const resetToken = await passwordService.generateResetToken(user.id);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Réinitialisation du mot de passe",
      text: `Clique sur ce lien pour réinitialiser ton mot de passe : ${resetUrl}`,
    });

    return res.status(200).json({ message: "Email envoyé !" });
  } catch (error) {
    console.error("requestPasswordReset error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and password are required" });

    const record = await passwordService.verifyResetToken(token);
    if (!record) return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({ where: { id: record.userId }, data: { password: hashedPassword } });

    // remove token
    await passwordService.deleteResetToken(record.id);

    return res.status(200).json({ message: "Mot de passe mis à jour" });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

