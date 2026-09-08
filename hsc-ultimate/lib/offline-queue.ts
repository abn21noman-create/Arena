// ===================================================================
// Offline queue for explicitly integrated mutations — IndexedDB
// -------------------------------------------------------------------
// MASTER_PLAN.md এর মূল ভিশনের একটা আংশিক-সম্পন্ন আইটেম: "Offline PWA
// full sync" (আগে শুধু Service Worker + offline.html fallback ছিল,
// শুধু পড়ার জন্য cache করা কনটেন্ট — কোনো mutation/write অফলাইনে
// সম্ভব ছিল না)। এই ফিচার অফলাইনে করা write action (habit toggle,
// topic mastery status আপডেট) সংরক্ষণ করে রাখে এবং ইন্টারনেট ফিরে
// এলে স্বয়ংক্রিয়ভাবে সার্ভারে পাঠিয়ে দেয়।
//
// Deep Research (web_search দিয়ে verify করা): PWA offline-first অ্যাপ
// গুলোর (Workbox Background Sync, বিভিন্ন ২০২৫-২৬ টিউটোরিয়াল) প্রমাণিত
// প্যাটার্ন — "Outbox Queue" বা "Sync Queue" — সব mutation প্রথমে
// IndexedDB তে সেভ হয় (instant UI feedback), তারপর background এ
// রিপ্লে করা হয়, ব্যর্থ হলে retry limit পর্যন্ত আবার চেষ্টা হয়।
//
// ডিজাইন সিদ্ধান্ত:
// - নেটিভ ব্রাউজার `indexedDB` API সরাসরি ব্যবহার করা হয়েছে (কোনো
//   external library/dependency ছাড়া — Dexie/idb ইত্যাদি লাগেনি,
//   কম bundle size, dependency-free)
// - শুধু idempotent-safe mutation এই queue এ যোগ করা হয় (topic
//   progress status set করা — বারবার একই status সেট করলে একই ফলাফল;
//   habit toggle — parity-preserving, দুইবার toggle করলে original
//   state এ ফিরে আসে, তাই queue replay এ সমস্যা হয় না)
// - Background Sync API (`registration.sync.register()`) ব্যবহার করা
//   হয়নি কারণ এটা Safari/iOS এ সাপোর্ট নেই — এর বদলে `window`
//   `online` ইভেন্ট + app load এর সময় queue process করার সহজ, সব
//   ব্রাউজারে কাজ করা approach ব্যবহার করা হয়েছে
// - সর্বোচ্চ ৫ বার retry, তারপর queue থেকে বাদ দেওয়া হয় (এবং ইউজারকে
//   জানানো হয় sync ব্যর্থ হয়েছে)
// ===================================================================

const DB_NAME = "hsc-ultimate-offline-queue";
const DB_VERSION = 1;
const STORE_NAME = "queued-actions";
export const MAX_RETRIES = 5;

export interface QueuedAction {
  id: string; // crypto.randomUUID()
  url: string;
  method: "POST" | "PATCH" | "DELETE";
  body: string | null; // JSON.stringify করা, null হলে বডি ছাড়া রিকোয়েস্ট
  label: string; // UI তে দেখানোর জন্য মানুষ-পড়ার-উপযোগী বর্ণনা (যেমন "Habit চেক-ইন")
  createdAt: number;
  retryCount: number;
}

/**
 * IndexedDB ডাটাবেস ওপেন করে (না থাকলে তৈরি করে)। ব্রাউজার ছাড়া
 * (SSR/Node টেস্ট এনভায়রনমেন্ট) `indexedDB` গ্লোবাল না থাকলে reject করে।
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB এই এনভায়রনমেন্টে উপলব্ধ না"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** একটা নতুন action queue তে যোগ করে (অফলাইনে থাকা অবস্থায় ব্যর্থ হওয়া রিকোয়েস্ট) */
export async function enqueueAction(
  action: Omit<QueuedAction, "id" | "createdAt" | "retryCount">
): Promise<QueuedAction> {
  const db = await openDB();
  const fullAction: QueuedAction = {
    ...action,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    retryCount: 0,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(fullAction);
    tx.oncomplete = () => resolve(fullAction);
    tx.onerror = () => reject(tx.error);
  });
}

/** সব queued action ফেরত দেয় (createdAt অনুযায়ী পুরনো থেকে নতুন — ক্রম বজায় থাকে) */
export async function getQueuedActions(): Promise<QueuedAction[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const index = tx.objectStore(STORE_NAME).index("createdAt");
    const request = index.getAll();
    request.onsuccess = () => resolve(request.result as QueuedAction[]);
    request.onerror = () => reject(request.error);
  });
}

/** কতগুলো action এখনো sync হওয়ার অপেক্ষায় আছে */
export async function getQueueCount(): Promise<number> {
  const actions = await getQueuedActions();
  return actions.length;
}

/** সফলভাবে sync হওয়া (বা retry limit পার হওয়া) action queue থেকে মুছে ফেলে */
export async function removeQueuedAction(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** একটা action এর retryCount বাড়িয়ে আপডেট করে */
export async function incrementRetryCount(id: string): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const action = getRequest.result as QueuedAction | undefined;
      if (!action) {
        resolve(-1);
        return;
      }
      action.retryCount += 1;
      store.put(action);
      resolve(action.retryCount);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

/** পুরো queue খালি করে দেয় (টেস্টিং/ডিবাগিং এর জন্য) */
export async function clearQueue(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
