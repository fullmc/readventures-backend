import prisma from "../config/prisma";
import passwordService from "../services/password.service";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: ts-node src/scripts/generateResetTokenForUser.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  const token = await passwordService.generateResetToken(user.id);
  console.log("RESET_TOKEN:", token);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
