import { NextResponse } from "next/server";
import { z } from "zod";
import { protectApiRoute } from "@/lib/api-security";
import { prisma } from "@/lib/prisma";
import {
  CURRENT_AGE_ASSURANCE_VERSION,
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
  getPolicyReadiness,
  isCurrentPolicyAcceptance,
} from "@/lib/privacy-compliance";

const acceptanceSchema = z.object({
  accepted: z.literal(true),
  ageAssuranceConfirmed: z.literal(true),
  privacyVersion: z.literal(CURRENT_PRIVACY_VERSION),
  termsVersion: z.literal(CURRENT_TERMS_VERSION),
  ageAssuranceVersion: z.literal(CURRENT_AGE_ASSURANCE_VERSION),
});

export async function GET(request: Request) {
  const guard = await protectApiRoute(request, "read", "policy-acceptance:read");
  if (!guard.ok) return guard.response;

  const latest = await prisma.policyAcceptance.findFirst({
    where: { userId: guard.userId },
    orderBy: { acceptedAt: "desc" },
    select: {
      privacyVersion: true,
      termsVersion: true,
      ageAssuranceVersion: true,
      source: true,
      acceptedAt: true,
    },
  });

  return NextResponse.json(
    {
      latest,
      current: isCurrentPolicyAcceptance(latest),
      policy: getPolicyReadiness().versions,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  const guard = await protectApiRoute(request, "update", "policy-acceptance:record");
  if (!guard.ok) return guard.response;

  const parsed = acceptanceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Policy version বদলেছে বা required assurance সম্পূর্ণ নয়। Page refresh করে আবার পড়ুন।",
        code: "POLICY_VERSION_OR_ASSURANCE_MISMATCH",
      },
      { status: 409, headers: { "Cache-Control": "no-store" } }
    );
  }

  const acceptance = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${guard.userId} FOR UPDATE`;
    const key = {
      userId: guard.userId,
      privacyVersion: CURRENT_PRIVACY_VERSION,
      termsVersion: CURRENT_TERMS_VERSION,
      ageAssuranceVersion: CURRENT_AGE_ASSURANCE_VERSION,
    };
    const existing = await tx.policyAcceptance.findUnique({
      where: { userId_privacyVersion_termsVersion_ageAssuranceVersion: key },
      select: {
        privacyVersion: true,
        termsVersion: true,
        ageAssuranceVersion: true,
        source: true,
        acceptedAt: true,
      },
    });
    if (existing) return existing;

    const saved = await tx.policyAcceptance.create({
      data: { ...key, source: "SETTINGS" },
      select: {
        privacyVersion: true,
        termsVersion: true,
        ageAssuranceVersion: true,
        source: true,
        acceptedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: guard.userId,
        action: "POLICY_ACCEPTANCE_RECORDED",
        targetType: "PolicyAcceptance",
        metadata: {
          privacyVersion: CURRENT_PRIVACY_VERSION,
          termsVersion: CURRENT_TERMS_VERSION,
          ageAssuranceVersion: CURRENT_AGE_ASSURANCE_VERSION,
          source: saved.source,
        },
      },
    });
    return saved;
  });

  return NextResponse.json(
    { acceptance, current: true },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  );
}
