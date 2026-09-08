// ===================================================================
// একটা ইউজারকে ADMIN বানানোর স্ক্রিপ্ট
// রান করার নিয়ম: pnpm make-admin your-email@example.com
// ===================================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("❌ ইমেইল দিন: pnpm make-admin your-email@example.com");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: {
      role: "ADMIN",
      authVersion: { increment: 1 },
    },
  });

  console.log(`✅ ${user.name} (${user.email}) এখন ADMIN!`);
}

main()
  .catch((e) => {
    console.error("❌ সমস্যা হয়েছে:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
