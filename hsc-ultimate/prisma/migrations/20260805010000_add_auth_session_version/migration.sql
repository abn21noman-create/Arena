-- Revoke stale JWT sessions after password, role or ban-state changes.
ALTER TABLE "users"
ADD COLUMN "authVersion" INTEGER NOT NULL DEFAULT 0;
