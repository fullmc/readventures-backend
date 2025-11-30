import crypto from "crypto";
import prisma from "../config/prisma";

export const generateResetToken = async (userId: number) => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt,
    },
  });

  return resetToken;
};

export const verifyResetToken = async (token: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!record) return null;
  if (record.expiresAt < new Date()) return null;

  return record;
};

export const deleteResetToken = async (id: number) => {
  await prisma.passwordResetToken.delete({ where: { id } });
};

export default {
  generateResetToken,
  verifyResetToken,
  deleteResetToken,
};
