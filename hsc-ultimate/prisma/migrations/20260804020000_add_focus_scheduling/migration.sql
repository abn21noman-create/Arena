CREATE TYPE "FocusScheduleRepeat" AS ENUM ('NONE', 'DAILY', 'WEEKLY');
CREATE TYPE "FocusScheduleStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "focus_schedules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdById" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "subjectCode" "SubjectCode",
    "focusLabel" VARCHAR(120),
    "repeat" "FocusScheduleRepeat" NOT NULL DEFAULT 'NONE',
    "status" "FocusScheduleStatus" NOT NULL DEFAULT 'ACTIVE',
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Dhaka',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "nextRunAt" TIMESTAMP(3),
    "lastRunAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "lastResult" VARCHAR(80),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "focus_schedules_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "focus_schedules_duration_check" CHECK ("durationMinutes" BETWEEN 20 AND 120)
);

ALTER TABLE "focus_sessions" ADD COLUMN "focusScheduleId" TEXT;

CREATE INDEX "focus_schedules_status_nextRunAt_idx" ON "focus_schedules"("status", "nextRunAt");
CREATE INDEX "focus_schedules_userId_status_nextRunAt_idx" ON "focus_schedules"("userId", "status", "nextRunAt");
CREATE INDEX "focus_schedules_createdById_createdAt_idx" ON "focus_schedules"("createdById", "createdAt");
CREATE INDEX "focus_sessions_focusScheduleId_startedAt_idx" ON "focus_sessions"("focusScheduleId", "startedAt");

ALTER TABLE "focus_schedules"
    ADD CONSTRAINT "focus_schedules_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "focus_schedules"
    ADD CONSTRAINT "focus_schedules_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "focus_sessions"
    ADD CONSTRAINT "focus_sessions_focusScheduleId_fkey"
    FOREIGN KEY ("focusScheduleId") REFERENCES "focus_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
