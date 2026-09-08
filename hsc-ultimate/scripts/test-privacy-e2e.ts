import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { deleteUserAccount, exportUserData } from "@/lib/account-privacy";
import {
  CURRENT_AGE_ASSURANCE_VERSION,
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
} from "@/lib/privacy-compliance";
import { FOCUS_CONSENT_VERSION } from "@/lib/focus-constants";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function containsForbiddenExportKey(value: unknown): boolean {
  const forbidden = new Set([
    "passwordHash",
    "token",
    "endpoint",
    "p256dh",
    "auth",
    "embedding",
    "ipAddress",
    "actorEmail",
  ]);
  if (Array.isArray(value)) return value.some(containsForbiddenExportKey);
  if (!value || typeof value !== "object") return false;
  return Object.entries(value as Record<string, unknown>).some(
    ([key, nested]) => forbidden.has(key) || containsForbiddenExportKey(nested)
  );
}

async function main() {
  const marker = randomUUID();
  const email = `privacy-e2e-${marker}@example.invalid`;
  let userId: string | null = null;
  let campaignId: string | null = null;
  let templateId: string | null = null;

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { name: "Privacy E2E", email, passwordHash: null },
        select: { id: true },
      });
      await tx.policyAcceptance.create({
        data: {
          userId: created.id,
          privacyVersion: CURRENT_PRIVACY_VERSION,
          termsVersion: CURRENT_TERMS_VERSION,
          ageAssuranceVersion: CURRENT_AGE_ASSURANCE_VERSION,
          source: "E2E_TEST",
        },
      });
      return created;
    });
    userId = user.id;

    await prisma.focusContract.create({
      data: {
        userId,
        allowAdminStart: true,
        consentVersion: FOCUS_CONSENT_VERSION,
        consentedAt: new Date(),
      },
    });
    await prisma.chatMessage.create({
      data: { userId, role: "user", content: "privacy export test" },
    });
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
    const campaign = await prisma.broadcastCampaign.create({
      data: {
        sentById: userId,
        title: "Privacy E2E",
        body: "Temporary delivery",
        targetType: "ALL_USERS",
      },
    });
    campaignId = campaign.id;
    await prisma.broadcastRecipient.create({
      data: { campaignId, userId },
    });
    const template = await prisma.broadcastTemplate.create({
      data: {
        createdById: userId,
        name: "Privacy E2E",
        title: "Privacy E2E",
        body: "Temporary template",
      },
    });
    templateId = template.id;
    await prisma.auditLog.createMany({
      data: [
        {
          actorId: userId,
          actorName: "Privacy E2E",
          actorEmail: email,
          action: "PRIVACY_E2E_ACTOR",
          ipAddress: "192.0.2.1",
        },
        {
          action: "PRIVACY_E2E_TARGET",
          targetType: "User",
          targetId: userId,
          metadata: { email, marker },
        },
        {
          action: "PRIVACY_E2E_METADATA_TARGET",
          targetType: "FocusSession",
          targetId: marker,
          metadata: { targetUserId: userId, marker },
        },
      ],
    });

    const exported = await exportUserData(userId);
    assert(exported.profile.id === userId, "profile missing from export");
    assert(exported.policyAcceptances.length === 1, "policy acceptance missing from export");
    assert(exported.focus.contract?.consentVersion === FOCUS_CONSENT_VERSION, "Focus contract missing");
    assert(exported.aiAndDocuments.chatMessages.length === 1, "AI chat missing");
    assert(!containsForbiddenExportKey(exported), "credential/security key leaked in export");

    const deleted = await deleteUserAccount(userId);
    assert(deleted.deleted && deleted.directReferencesHandled, "delete result incomplete");

    const [
      remainingUser,
      remainingAcceptance,
      remainingReset,
      remainingRecipient,
      actorAudit,
      targetAudit,
      metadataTargetAudit,
      retainedCampaign,
      retainedTemplate,
    ] = await Promise.all([
      prisma.user.count({ where: { id: userId } }),
      prisma.policyAcceptance.count({ where: { userId } }),
      prisma.passwordResetToken.count({ where: { email } }),
      prisma.broadcastRecipient.count({ where: { userId } }),
      prisma.auditLog.findFirst({ where: { action: "PRIVACY_E2E_ACTOR" } }),
      prisma.auditLog.findFirst({ where: { action: "PRIVACY_E2E_TARGET" } }),
      prisma.auditLog.findFirst({ where: { action: "PRIVACY_E2E_METADATA_TARGET" } }),
      prisma.broadcastCampaign.findUnique({ where: { id: campaignId } }),
      prisma.broadcastTemplate.findUnique({ where: { id: templateId } }),
    ]);
    assert(remainingUser === 0, "user was not deleted");
    assert(remainingAcceptance === 0, "acceptance was not cascade-deleted");
    assert(remainingReset === 0, "reset token was not deleted");
    assert(remainingRecipient === 0, "broadcast recipient was not deleted");
    assert(
      actorAudit?.actorId === null &&
        actorAudit.actorName === null &&
        actorAudit.actorEmail === null &&
        actorAudit.ipAddress === null,
      "actor audit was not de-identified"
    );
    assert(
      targetAudit?.targetType === "DeletedUser" && targetAudit.targetId === null,
      "target audit was not redacted"
    );
    assert(
      JSON.stringify(metadataTargetAudit?.metadata).includes('"redacted":true'),
      "metadata target user reference was not redacted"
    );
    assert(retainedCampaign?.sentById === null, "campaign sender reference was not cleared");
    assert(retainedTemplate?.createdById === null, "template creator reference was not cleared");

    console.log("Privacy live E2E: 16/16 assertions passed");
  } finally {
    if (userId) {
      await deleteUserAccount(userId).catch(() => undefined);
    }
    await prisma.auditLog.deleteMany({
      where: {
        action: {
          in: [
            "PRIVACY_E2E_ACTOR",
            "PRIVACY_E2E_TARGET",
            "PRIVACY_E2E_METADATA_TARGET",
          ],
        },
      },
    });
    if (campaignId) await prisma.broadcastCampaign.deleteMany({ where: { id: campaignId } });
    if (templateId) await prisma.broadcastTemplate.deleteMany({ where: { id: templateId } });
    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Privacy live E2E failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
