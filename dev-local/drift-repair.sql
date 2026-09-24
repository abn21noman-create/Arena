-- ===================================================================
-- Drift repair: bring the live database in line with prisma/schema.prisma
-- -------------------------------------------------------------------
-- The repository migrations are a *reconstructed* baseline, so the
-- admin Broadcast feature (3 tables + 2 enums) and User.preferredLanguage
-- were never migrated. This applies exactly those missing objects, using
-- Prisma's own DDL conventions (TEXT / TIMESTAMP(3) / CURRENT_TIMESTAMP).
--
-- Idempotent: safe to run more than once.
-- ===================================================================

-- ---------- 1. users.preferredLanguage ----------
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "preferredLanguage" TEXT NOT NULL DEFAULT 'banglish';

-- ---------- 2. enums ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BroadcastTargetType') THEN
    CREATE TYPE "BroadcastTargetType" AS ENUM
      ('ALL_USERS', 'BY_ROLE', 'BY_SUBJECT', 'BY_STREAK', 'BY_HSC_BATCH');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BroadcastStatus') THEN
    CREATE TYPE "BroadcastStatus" AS ENUM
      ('DRAFT', 'SENDING', 'COMPLETED', 'FAILED');
  END IF;
END
$$;

-- ---------- 3. broadcast_campaigns ----------
CREATE TABLE IF NOT EXISTS "broadcast_campaigns" (
    "id"              TEXT NOT NULL,
    "sentById"        TEXT,
    "title"           TEXT NOT NULL,
    "body"            TEXT NOT NULL,
    "link"            TEXT,
    "icon"            TEXT,
    "targetType"      "BroadcastTargetType" NOT NULL,
    "targetFilter"    JSONB,
    "sendInApp"       BOOLEAN NOT NULL DEFAULT true,
    "sendPush"        BOOLEAN NOT NULL DEFAULT true,
    "sendEmail"       BOOLEAN NOT NULL DEFAULT false,
    "sendNativePush"  BOOLEAN NOT NULL DEFAULT false,
    "status"          "BroadcastStatus" NOT NULL DEFAULT 'DRAFT',
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "sentCount"       INTEGER NOT NULL DEFAULT 0,
    "failedCount"     INTEGER NOT NULL DEFAULT 0,
    "readCount"       INTEGER NOT NULL DEFAULT 0,
    "scheduledFor"    TIMESTAMP(3),
    "startedAt"       TIMESTAMP(3),
    "completedAt"     TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "broadcast_campaigns_status_createdAt_idx"
  ON "broadcast_campaigns"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "broadcast_campaigns_sentById_createdAt_idx"
  ON "broadcast_campaigns"("sentById", "createdAt");

-- ---------- 4. broadcast_recipients ----------
CREATE TABLE IF NOT EXISTS "broadcast_recipients" (
    "id"                  TEXT NOT NULL,
    "campaignId"          TEXT NOT NULL,
    "userId"              TEXT NOT NULL,
    "inAppDelivered"      BOOLEAN NOT NULL DEFAULT false,
    "inAppRead"           BOOLEAN NOT NULL DEFAULT false,
    "pushDelivered"       BOOLEAN NOT NULL DEFAULT false,
    "emailDelivered"      BOOLEAN NOT NULL DEFAULT false,
    "nativePushDelivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt"         TIMESTAMP(3),
    "readAt"              TIMESTAMP(3),
    "failedReason"        TEXT,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broadcast_recipients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "broadcast_recipients_campaignId_userId_key"
  ON "broadcast_recipients"("campaignId", "userId");
CREATE INDEX IF NOT EXISTS "broadcast_recipients_userId_inAppRead_idx"
  ON "broadcast_recipients"("userId", "inAppRead");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'broadcast_recipients_campaignId_fkey'
  ) THEN
    ALTER TABLE "broadcast_recipients"
      ADD CONSTRAINT "broadcast_recipients_campaignId_fkey"
      FOREIGN KEY ("campaignId") REFERENCES "broadcast_campaigns"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- ---------- 5. broadcast_templates ----------
CREATE TABLE IF NOT EXISTS "broadcast_templates" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "body"        TEXT NOT NULL,
    "link"        TEXT,
    "icon"        TEXT DEFAULT '📚',
    "targetType"  "BroadcastTargetType" NOT NULL DEFAULT 'ALL_USERS',
    "variables"   JSONB,
    "usageCount"  INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt"  TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_templates_pkey" PRIMARY KEY ("id")
);
