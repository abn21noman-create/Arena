-- CreateEnum
CREATE TYPE "ReadingRoomTheme" AS ENUM ('LOFI_CAFE', 'DARK_ACADEMIA', 'COZY_LIBRARY', 'RAINY_WINDOW', 'SILENT_HALL');

-- CreateEnum
CREATE TYPE "ReadingRoomActivity" AS ENUM ('SELF_STUDY', 'CLASS', 'BREAK');

-- CreateTable
CREATE TABLE "reading_room_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "room" "ReadingRoomTheme" NOT NULL,
    "activity" "ReadingRoomActivity" NOT NULL DEFAULT 'SELF_STUDY',
    "goal" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastHeartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "totalFocusSec" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_room_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reading_room_sessions_room_endedAt_lastHeartbeatAt_idx" ON "reading_room_sessions"("room", "endedAt", "lastHeartbeatAt");

-- CreateIndex
CREATE INDEX "reading_room_sessions_userId_endedAt_idx" ON "reading_room_sessions"("userId", "endedAt");

-- AddForeignKey
ALTER TABLE "reading_room_sessions" ADD CONSTRAINT "reading_room_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
