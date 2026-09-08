-- Native Android/FCM delivery diagnostics and receipt tracking.
-- Additive: existing device tokens remain registered and no Focus data is removed.
ALTER TABLE "native_devices"
    ADD COLUMN "appVersion" VARCHAR(40),
    ADD COLUMN "deviceModel" VARCHAR(120),
    ADD COLUMN "lastPushAttemptAt" TIMESTAMP(3),
    ADD COLUMN "lastPushSuccessAt" TIMESTAMP(3),
    ADD COLUMN "lastPushFailureAt" TIMESTAMP(3),
    ADD COLUMN "lastPushErrorCode" VARCHAR(100),
    ADD COLUMN "lastCommandId" VARCHAR(64),
    ADD COLUMN "lastReceiptAt" TIMESTAMP(3),
    ADD COLUMN "lastReceiptStatus" VARCHAR(64),
    ADD COLUMN "disabledAt" TIMESTAMP(3),
    ADD COLUMN "disabledReason" VARCHAR(100);

DROP INDEX "native_devices_userId_remoteFocusCapable_idx";
CREATE INDEX "native_devices_userId_remoteFocusCapable_disabledAt_idx"
    ON "native_devices"("userId", "remoteFocusCapable", "disabledAt");
CREATE INDEX "native_devices_lastSeenAt_idx" ON "native_devices"("lastSeenAt");

CREATE TABLE "native_push_deliveries" (
    "id" TEXT NOT NULL,
    "commandId" VARCHAR(64) NOT NULL,
    "deviceId" TEXT NOT NULL,
    "sessionId" VARCHAR(80) NOT NULL,
    "type" VARCHAR(24) NOT NULL,
    "status" VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "receiptAt" TIMESTAMP(3),
    "errorCode" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "native_push_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "native_push_deliveries_commandId_deviceId_key"
    ON "native_push_deliveries"("commandId", "deviceId");
CREATE INDEX "native_push_deliveries_deviceId_createdAt_idx"
    ON "native_push_deliveries"("deviceId", "createdAt");
CREATE INDEX "native_push_deliveries_sessionId_type_createdAt_idx"
    ON "native_push_deliveries"("sessionId", "type", "createdAt");
CREATE INDEX "native_push_deliveries_status_createdAt_idx"
    ON "native_push_deliveries"("status", "createdAt");

ALTER TABLE "native_push_deliveries"
    ADD CONSTRAINT "native_push_deliveries_deviceId_fkey"
    FOREIGN KEY ("deviceId") REFERENCES "native_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
