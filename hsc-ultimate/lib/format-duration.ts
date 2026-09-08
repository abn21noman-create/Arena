// ===================================================================
// Duration Formatting — সেকেন্ড থেকে বাংলা "ঘ মি সে" ফরম্যাট
// -------------------------------------------------------------------
// Client ও Server উভয় জায়গায় ব্যবহারযোগ্য pure function (Prisma/DB
// import নেই), তাই lib/reading-room.ts থেকে আলাদা রাখা হয়েছে — client
// component এ lib/reading-room.ts import করলে bundle এ Prisma চলে
// আসত, যা ভুল।
// ===================================================================
export function formatDurationBn(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}ঘ ${m}মি`;
  if (m > 0) return `${m}মি ${s}সে`;
  return `${s}সে`;
}
