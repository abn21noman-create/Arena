// ===================================================================
// Push Notification — Client-side utility (browser API সহায়ক ফাংশন)
// -------------------------------------------------------------------
// VAPID public key কে Uint8Array এ কনভার্ট করা (PushManager.subscribe()
// এর applicationServerKey হিসেবে ব্যবহার করার জন্য, standard pattern)।
// ===================================================================
export function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}
