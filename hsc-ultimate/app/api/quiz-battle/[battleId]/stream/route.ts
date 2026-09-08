// ===================================================================
// Quiz Battle রিয়েল-টাইম আপডেট — Server-Sent Events (SSE) স্ট্রিম
// GET /api/quiz-battle/[battleId]/stream
// -------------------------------------------------------------------
// আগে ক্লায়েন্ট প্রতি ৪ সেকেন্টে ফিক্সড-ইন্টারভাল পোলিং করত
// (`GET /api/quiz-battle/[battleId]` বারবার কল করে)। এখন এই একটামাত্র
// long-lived HTTP কানেকশনে সার্ভার নিজেই DB পরিবর্তন চেক করে এবং
// শুধু তখনই নতুন ডেটা পাঠায় যখন কিছু বদলেছে (নতুন participant যোগ
// দেওয়া, কেউ উত্তর জমা দেওয়া, battle শুরু/শেষ হওয়া) — ফলে লিডারবোর্ড
// প্রায় তাৎক্ষণিক (~১.৫ সেকেন্ড) আপডেট হয়, আগের ৪ সেকেন্ড দেরির বদলে।
//
// EventSource (ব্রাউজার নেটিভ API) কাস্টম হেডার পাঠাতে পারে না, কিন্তু
// same-origin হওয়ায় সেশন কুকি স্বয়ংক্রিয়ভাবেই পাঠানো হয় — তাই auth()
// এখানে স্বাভাবিকভাবেই কাজ করে।
//
// ⚠️ ভবিষ্যতে Vercel এ deploy করার সময় বিবেচ্য: Hobby প্ল্যানে serverless
// ফাংশন timeout ৬০ সেকেন্ড (Fluid Compute/Pro এ বেশি)। তাই নিচে
// MAX_STREAM_DURATION_MS দিয়ে কানেকশন স্বনির্ধারিত সময় পর normal ভাবে
// বন্ধ করে দেওয়া হয় — ব্রাউজারের EventSource নিজে থেকেই কয়েক সেকেন্ড
// পর reconnect করবে (এটা bug না, বরং serverless-friendly ডিজাইন)।
// deploy phase এ প্রয়োজনে `export const maxDuration = 60;` যোগ করা
// যেতে পারে যদি runtime সময়সীমা নিয়ে সমস্যা হয়।
// ===================================================================
import { auth } from "@/lib/auth";
import { getBattleDetail } from "@/lib/quiz-battle";

// Node.js runtime আবশ্যক (Edge runtime এ Prisma চলে না)
export const dynamic = "force-dynamic";

const POLL_INTERVAL_MS = 1500; // সার্ভার-সাইড DB চেক ইন্টারভাল
const HEARTBEAT_INTERVAL_MS = 15000; // প্রক্সি/লোড-ব্যালান্সার কানেকশন টাইমআউট এড়াতে
const MAX_STREAM_DURATION_MS = 20 * 60 * 1000; // ২০ মিনিট পর normal close (client auto-reconnect করবে)

export async function GET(
  req: Request,
  { params }: { params: Promise<{ battleId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("লগইন করা নেই", { status: 401 });
  }
  const userId = session.user.id;
  const { battleId } = await params;

  // স্ট্রিম শুরু করার আগেই একবার অ্যাক্সেস ভেরিফাই করা (403/404 দ্রুত রিটার্ন করার জন্য)
  try {
    const initial = await getBattleDetail(battleId, userId);
    if (!initial) {
      return new Response(JSON.stringify({ error: "Battle পাওয়া যায়নি" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "অ্যাক্সেস নেই";
    return new Response(JSON.stringify({ error: message }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  let lastPayload = "";
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // কানেকশন ইতিমধ্যে বন্ধ হয়ে গেছে
        }
      }

      function heartbeat() {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // no-op
        }
      }

      function finish() {
        if (closed) return;
        closed = true;
        clearInterval(pollTimer);
        clearInterval(heartbeatTimer);
        try {
          controller.close();
        } catch {
          // ইতিমধ্যে বন্ধ
        }
      }

      // প্রথমবার সাথে সাথেই ডেটা পাঠানো হয় (client কে অপেক্ষা করতে না হয়)
      try {
        const battle = await getBattleDetail(battleId, userId);
        if (battle) {
          lastPayload = JSON.stringify(battle);
          send("battle", battle);
          if (battle.status === "COMPLETED") {
            send("done", { reason: "completed" });
            finish();
            return;
          }
        }
      } catch (err) {
        send("error", { message: err instanceof Error ? err.message : "এরর হয়েছে" });
        finish();
        return;
      }

      const pollTimer = setInterval(async () => {
        if (closed) return;
        try {
          const battle = await getBattleDetail(battleId, userId);
          if (!battle) {
            send("error", { message: "Battle পাওয়া যায়নি" });
            finish();
            return;
          }
          const payload = JSON.stringify(battle);
          if (payload !== lastPayload) {
            lastPayload = payload;
            send("battle", battle);
          }
          if (battle.status === "COMPLETED") {
            send("done", { reason: "completed" });
            finish();
          }
        } catch (err) {
          send("error", { message: err instanceof Error ? err.message : "এরর হয়েছে" });
          finish();
        }
      }, POLL_INTERVAL_MS);

      const heartbeatTimer = setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);

      // ম্যাক্স ডিউরেশন পর normal ভাবে বন্ধ — client EventSource নিজে থেকেই reconnect করবে
      const maxTimer = setTimeout(() => {
        send("done", { reason: "max_duration" });
        finish();
      }, MAX_STREAM_DURATION_MS);

      // ক্লায়েন্ট ডিসকানেক্ট (ট্যাব বন্ধ/পেজ ছেড়ে যাওয়া) হ্যান্ডল করা
      req.signal.addEventListener("abort", () => {
        clearTimeout(maxTimer);
        finish();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Nginx-স্টাইল প্রক্সি buffering বন্ধ করা
    },
  });
}
