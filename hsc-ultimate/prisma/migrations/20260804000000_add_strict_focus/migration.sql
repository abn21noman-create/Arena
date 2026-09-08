-- Consent-based Strict Focus contracts and sessions
CREATE TYPE "FocusSessionSource" AS ENUM ('SELF', 'ADMIN');
CREATE TYPE "FocusSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'EMERGENCY_EXIT');

CREATE TABLE "focus_contracts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allowAdminStart" BOOLEAN NOT NULL DEFAULT false,
    "maxAdminDurationMinutes" INTEGER NOT NULL DEFAULT 120,
    "nativeEnforcementEnabled" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" TEXT NOT NULL DEFAULT '2026-08',
    "consentedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "focus_contracts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "focus_contracts_duration_check" CHECK ("maxAdminDurationMinutes" BETWEEN 20 AND 120)
);

CREATE TABLE "focus_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "initiatedById" TEXT,
    "source" "FocusSessionSource" NOT NULL,
    "status" "FocusSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "durationMinutes" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "nativeEnforcementRequested" BOOLEAN NOT NULL DEFAULT false,
    "nativeEnforcementActive" BOOLEAN NOT NULL DEFAULT false,
    "lastHeartbeatAt" TIMESTAMP(3),
    "emergencyExitedAt" TIMESTAMP(3),
    "emergencyReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "focus_sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "focus_sessions_duration_check" CHECK ("durationMinutes" BETWEEN 20 AND 120),
    CONSTRAINT "focus_sessions_time_check" CHECK ("endsAt" > "startedAt")
);

CREATE UNIQUE INDEX "focus_contracts_userId_key" ON "focus_contracts"("userId");
CREATE INDEX "focus_sessions_userId_status_endsAt_idx" ON "focus_sessions"("userId", "status", "endsAt");
CREATE INDEX "focus_sessions_initiatedById_createdAt_idx" ON "focus_sessions"("initiatedById", "createdAt");
-- Database-level race guard: at most one active session per target user.
CREATE UNIQUE INDEX "focus_sessions_one_active_per_user_idx"
    ON "focus_sessions"("userId") WHERE "status" = 'ACTIVE';

ALTER TABLE "focus_contracts"
    ADD CONSTRAINT "focus_contracts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "focus_sessions"
    ADD CONSTRAINT "focus_sessions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "focus_sessions"
    ADD CONSTRAINT "focus_sessions_initiatedById_fkey"
    FOREIGN KEY ("initiatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "native_devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'android',
    "remoteFocusCapable" BOOLEAN NOT NULL DEFAULT false,
    "accessibilityEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "native_devices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "native_devices_token_key" ON "native_devices"("token");
CREATE INDEX "native_devices_userId_remoteFocusCapable_idx"
    ON "native_devices"("userId", "remoteFocusCapable");

ALTER TABLE "native_devices"
    ADD CONSTRAINT "native_devices_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
