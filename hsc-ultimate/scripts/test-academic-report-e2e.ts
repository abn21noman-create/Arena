import { randomUUID } from "node:crypto";
import { deleteUserAccount } from "@/lib/account-privacy";
import { buildContentQualitySnapshot, getContentReviewTargetHash } from "@/lib/content-quality-server";
import { prisma } from "@/lib/prisma";

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

async function main() {
  const marker = randomUUID();
  const email = `academic-report-${marker}@example.invalid`;
  let userId: string | null = null;
  let reportId: string | null = null;
  try {
    const user = await prisma.user.create({
      data: { name: "Academic Report E2E", email },
      select: { id: true },
    });
    userId = user.id;
    const question = await prisma.question.findFirst({ select: { id: true } });
    assert(question, "No academic question available");
    const contentHash = await getContentReviewTargetHash("CORE_MCQ", question.id);
    assert(contentHash?.length === 64, "Exact content hash missing");

    const report = await prisma.academicContentReport.create({
      data: {
        userId,
        targetType: "CORE_MCQ",
        targetId: question.id,
        contentHash,
        reason: "EXPLANATION_ERROR",
        details: "E2E exact-version report; no academic content is modified.",
      },
    });
    reportId = report.id;
    assert(report.status === "PENDING", "New report is not pending");

    const duplicate = await prisma.academicContentReport.createMany({
      data: [{
        userId,
        targetType: "CORE_MCQ",
        targetId: question.id,
        contentHash,
        reason: "EXPLANATION_ERROR",
      }],
      skipDuplicates: true,
    });
    assert(duplicate.count === 0, "Exact duplicate report was not blocked");

    const reported = await buildContentQualitySnapshot({
      view: "REPORTED",
      pageSize: 2_000,
      maxPageSize: 2_000,
    });
    const item = reported.items.find((entry) => entry.targetId === question.id);
    assert(item, "Reported item missing from Admin quality queue");
    const queued = item.studentReports.find((entry) => entry.id === report.id);
    assert(queued?.status === "PENDING", "Pending report missing from item");
    assert(queued.stale === false, "New exact-version report marked stale");

    await prisma.$transaction([
      prisma.academicContentReport.update({
        where: { id: report.id },
        data: {
          status: "RESOLVED",
          reviewedAt: new Date(),
          resolutionNote: "E2E review completed without editing academic content.",
        },
      }),
      prisma.notification.create({
        data: {
          userId,
          title: "Academic report resolved",
          body: "E2E review complete",
          link: "/notifications",
        },
      }),
    ]);
    const [resolved, notification] = await Promise.all([
      prisma.academicContentReport.findUnique({ where: { id: report.id } }),
      prisma.notification.findFirst({ where: { userId, title: "Academic report resolved" } }),
    ]);
    assert(resolved?.status === "RESOLVED", "Report decision did not persist");
    assert(notification, "Reporter notification missing");

    await deleteUserAccount(userId);
    const remaining = await prisma.academicContentReport.count({ where: { id: report.id } });
    assert(remaining === 0, "Account deletion did not cascade academic reports");
    userId = null;
    reportId = null;

    console.log("Academic report live E2E: 10/10 assertions passed");
  } finally {
    if (reportId) await prisma.academicContentReport.deleteMany({ where: { id: reportId } });
    if (userId) await deleteUserAccount(userId).catch(() => undefined);
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Academic report live E2E failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
