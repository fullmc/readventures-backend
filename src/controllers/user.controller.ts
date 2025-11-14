import { Request, Response } from "express";

export const signupUser = async (req: Request, res: Response) => {
  res.send("Signup route OK");
};

export const loginUser = async (req: Request, res: Response) => {
  res.send("Login route OK");
};
