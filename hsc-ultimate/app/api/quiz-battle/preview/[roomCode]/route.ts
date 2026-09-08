// ===================================================================
// Room code দিয়ে Battle এর preview (join করার আগে দেখানোর জন্য —
// টাইটেল, সাবজেক্ট, বর্তমান participant সংখ্যা)
// GET /api/quiz-battle/preview/[roomCode]
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findBattleByRoomCode } from "@/lib/quiz-battle";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { roomCode } = await params;
  const battle = await findBattleByRoomCode(roomCode);

  if (!battle) {
    return NextResponse.json({ error: "এই কোডে কোনো Battle পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({
    battle: {
      id: battle.id,
      title: battle.title,
      status: battle.status,
      subjectName: battle.subject?.name ?? null,
      ownerName: battle.owner.name,
      participantCount: battle._count.participants,
      maxPlayers: battle.maxPlayers,
    },
  });
}
