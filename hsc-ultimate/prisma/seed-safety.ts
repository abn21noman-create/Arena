import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

// Shared guard for legacy seed scripts that delete/recreate live rows.
// Safe incremental import tools do not use this module.
export function assertDestructiveSeedAllowed(scriptName: string) {
  const explicit = process.env.ALLOW_DESTRUCTIVE_SEED === "I_UNDERSTAND_THIS_DELETES_DATA";
  if (!explicit) {
    throw new Error(
      `${scriptName} blocked: set ALLOW_DESTRUCTIVE_SEED=I_UNDERSTAND_THIS_DELETES_DATA only after backup/review`
    );
  }

  const raw = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
  let remote = true;
  try {
    const url = new URL(raw);
    remote = !["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    remote = !raw.startsWith("file:");
  }
  if (
    remote &&
    process.env.ALLOW_REMOTE_DESTRUCTIVE_SEED !== "REMOTE_DATABASE_BACKUP_VERIFIED"
  ) {
    throw new Error(
      `${scriptName} blocked on remote database: backup verification acknowledgement missing`
    );
  }
}
