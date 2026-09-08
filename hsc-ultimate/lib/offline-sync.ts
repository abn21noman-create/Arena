// ===================================================================
// Offline queue processor for explicitly integrated mutations
// -------------------------------------------------------------------
// ইন্টারনেট ফিরে এলে (window "online" ইভেন্ট বা app load এ) IndexedDB
// queue এর সব pending action ক্রমানুসারে সার্ভারে পাঠায়। ব্যর্থ হলে
// retryCount বাড়ায়, MAX_RETRIES পার হলে queue থেকে বাদ দিয়ে দেয়
// (চিরস্থায়ীভাবে আটকে থাকা এড়াতে)।
// ===================================================================
import {
  getQueuedActions,
  removeQueuedAction,
  incrementRetryCount,
  MAX_RETRIES,
  type QueuedAction,
} from "@/lib/offline-queue";

export interface SyncResult {
  succeeded: QueuedAction[];
  failed: QueuedAction[]; // retry এর জন্য queue তেই থেকে গেছে
  abandoned: QueuedAction[]; // MAX_RETRIES পার হয়ে বাদ দেওয়া হয়েছে
}

let isSyncing = false; // একই সাথে একাধিক sync চলা আটকাতে (double "online" event ইত্যাদি)

/**
 * queue এর সব pending action ক্রমানুসারে (createdAt অনুযায়ী) সার্ভারে
 * পাঠানোর চেষ্টা করে। একবারে একটা করে (parallel না) — কারণ কিছু
 * mutation এর ক্রম গুরুত্বপূর্ণ হতে পারে (যেমন একই habit বারবার toggle)।
 */
export async function processQueue(): Promise<SyncResult> {
  const result: SyncResult = { succeeded: [], failed: [], abandoned: [] };

  if (isSyncing) return result; // ইতিমধ্যে একটা sync চলছে, নতুন করে শুরু করার দরকার নেই
  if (typeof navigator !== "undefined" && !navigator.onLine) return result; // এখনো অফলাইন

  isSyncing = true;
  try {
    const actions = await getQueuedActions();

    for (const action of actions) {
      try {
        const res = await fetch(action.url, {
          method: action.method,
          headers: action.body ? { "Content-Type": "application/json" } : undefined,
          body: action.body ?? undefined,
        });

        if (res.ok) {
          await removeQueuedAction(action.id);
          result.succeeded.push(action);
        } else {
          // 4xx এরর (validation/auth) retry করলেও ঠিক হবে না — সাথে
          // সাথে বাদ দেওয়া হয় (অনন্তকাল আটকে থাকা এড়াতে)
          if (res.status >= 400 && res.status < 500) {
            await removeQueuedAction(action.id);
            result.abandoned.push(action);
          } else {
            const newCount = await incrementRetryCount(action.id);
            if (newCount >= MAX_RETRIES) {
              await removeQueuedAction(action.id);
              result.abandoned.push(action);
            } else {
              result.failed.push(action);
            }
          }
        }
      } catch {
        // নেটওয়ার্ক এরর (আবার অফলাইন হয়ে গেছে) — retry এর জন্য queue তে রেখে দেওয়া
        const newCount = await incrementRetryCount(action.id);
        if (newCount >= MAX_RETRIES) {
          await removeQueuedAction(action.id);
          result.abandoned.push(action);
        } else {
          result.failed.push(action);
        }
      }
    }
  } finally {
    isSyncing = false;
  }

  return result;
}
