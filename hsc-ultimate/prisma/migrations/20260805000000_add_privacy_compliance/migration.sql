-- Privacy & Compliance Center
-- Versioned policy acknowledgement records are additive and do not infer
-- acceptance for existing users. Existing accounts remain usable and can
-- acknowledge the current versions explicitly from Settings.

CREATE TABLE "policy_acceptances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "privacyVersion" VARCHAR(32) NOT NULL,
    "termsVersion" VARCHAR(32) NOT NULL,
    "ageAssuranceVersion" VARCHAR(32) NOT NULL,
    "source" VARCHAR(32) NOT NULL DEFAULT 'REGISTRATION',
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_acceptances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "policy_acceptance_versions_key"
ON "policy_acceptances"(
    "userId",
    "privacyVersion",
    "termsVersion",
    "ageAssuranceVersion"
);

CREATE INDEX "policy_acceptances_userId_acceptedAt_idx"
ON "policy_acceptances"("userId", "acceptedAt");

ALTER TABLE "policy_acceptances"
ADD CONSTRAINT "policy_acceptances_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- The disclosure changed materially in this phase. Do not silently upgrade
-- existing consent rows; version mismatch forces explicit re-confirmation.
ALTER TABLE "focus_contracts"
ALTER COLUMN "consentVersion" SET DEFAULT '2026-08-05';
