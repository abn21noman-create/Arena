-- Bounded one-row operational heartbeat/state for external Focus scheduling.
-- Additive only: no existing schedule/session/content rows are changed.
CREATE TABLE "focus_scheduler_state" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "lastStartedAt" TIMESTAMP(3),
    "lastCompletedAt" TIMESTAMP(3),
    "lastSuccessAt" TIMESTAMP(3),
    "lastFailureAt" TIMESTAMP(3),
    "lastStatus" VARCHAR(32) NOT NULL DEFAULT 'NEVER',
    "lastSource" VARCHAR(16),
    "lastDurationMs" INTEGER,
    "lastReminderCount" INTEGER NOT NULL DEFAULT 0,
    "lastDueCount" INTEGER NOT NULL DEFAULT 0,
    "lastProcessedCount" INTEGER NOT NULL DEFAULT 0,
    "lastStartedCount" INTEGER NOT NULL DEFAULT 0,
    "lastFailedCount" INTEGER NOT NULL DEFAULT 0,
    "lastErrorCode" VARCHAR(80),
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "overlapSkips" INTEGER NOT NULL DEFAULT 0,
    "leaseToken" VARCHAR(64),
    "leaseExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "focus_scheduler_state_pkey" PRIMARY KEY ("id")
);
