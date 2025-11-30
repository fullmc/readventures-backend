import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import passwordService from "../services/password.service";

async function main() {
  const testEmail = "test-reset@example.com";
  const originalPassword = "oldPassword123";
  const newPassword = "newPassword456";

  // Cleanup existing test user
  await prisma.passwordResetToken.deleteMany({ where: {} }).catch(() => {});
  await prisma.user.deleteMany({ where: { email: testEmail } }).catch(() => {});

  // Create a test user
  const hashed = await bcrypt.hash(originalPassword, 10);
  const user = await prisma.user.create({ data: { email: testEmail, password: hashed } });
  console.log("Created user:", user.id, user.email);

  // Generate reset token
  const resetToken = await passwordService.generateResetToken(user.id);
  console.log("Generated reset token (to send via email):", resetToken);

  // Verify the token
  const record = await passwordService.verifyResetToken(resetToken);
  if (!record) {
    console.error("Token verification failed");
    process.exit(1);
  }
  console.log("Token verified for userId:", record.userId);

  // Reset the password
  const hashedNew = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: record.userId }, data: { password: hashedNew } });
  console.log("Password updated for userId:", record.userId);

  // Delete token
  await passwordService.deleteResetToken(record.id);
  console.log("Reset token deleted");

  // Confirm login with new password
  const found = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!found || !found.password) {
    console.error("User not found after reset");
    process.exit(1);
  }

  const valid = await bcrypt.compare(newPassword, found.password);
  console.log("Password verify with new password:", valid);

  // Cleanup
  await prisma.passwordResetToken.deleteMany({ where: {} }).catch(() => {});
  await prisma.user.deleteMany({ where: { email: testEmail } }).catch(() => {});

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
