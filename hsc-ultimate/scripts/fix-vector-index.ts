// ===================================================================
// pgvector HNSW ইনডেক্স Recovery Script
// -------------------------------------------------------------------
// এটা একটা known, documented Prisma সীমাবদ্ধতা: `prisma migrate dev`
// pgvector এর HNSW/ivfflat ইনডেক্স ট্র্যাক করতে পারে না (Prisma schema তে
// `Unsupported("vector(N)")` টাইপের উপর native ইনডেক্স সাপোর্ট নেই),
// ফলে প্রতিবার নতুন migration চালালে raw SQL দিয়ে ম্যানুয়ালি যোগ করা এই
// ইনডেক্সটাকে "schema তে নেই এমন drift" মনে করে ভুলবশত ড্রপ করে দেয়।
//
// রেফারেন্স: https://github.com/prisma/prisma/issues/28414
//            pgvector npm docs: "prisma migrate dev does not support
//            pgvector indexes"
//
// এই স্ক্রিপ্ট PdfChunk.embedding কলামের HNSW ইনডেক্স আছে কিনা চেক করে,
// না থাকলে আবার তৈরি করে দেয়। প্রতিবার `prisma migrate dev`/`migrate deploy`
// চালানোর পরে এটা চালানো উচিত (package.json এ `db:fix-vector-index` script
// হিসেবে যোগ করা আছে)।
// ===================================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.$queryRawUnsafe<{ indexname: string }[]>(
    `SELECT indexname FROM pg_indexes WHERE tablename = 'pdf_chunks' AND indexname = 'pdf_chunks_embedding_idx';`
  );

  if (existing.length > 0) {
    console.log("✅ pdf_chunks_embedding_idx (HNSW) ইতিমধ্যে উপস্থিত, কিছু করার দরকার নেই।");
    return;
  }

  console.log("⚠️  pdf_chunks_embedding_idx পাওয়া যায়নি (সম্ভবত সাম্প্রতিক migrate dev এ ড্রপ হয়ে গেছে) — পুনরুদ্ধার করা হচ্ছে...");
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "pdf_chunks_embedding_idx" ON "pdf_chunks" USING hnsw ("embedding" vector_cosine_ops);`
  );
  console.log("✅ pdf_chunks_embedding_idx (HNSW) পুনরুদ্ধার করা হয়েছে।");
}

main()
  .catch((err) => {
    console.error("❌ ভেক্টর ইনডেক্স ফিক্স স্ক্রিপ্ট ব্যর্থ হয়েছে:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
