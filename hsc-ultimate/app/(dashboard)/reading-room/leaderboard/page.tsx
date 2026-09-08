// ===================================================================
// Reading Room Study Time Leaderboard পেজ (Server Component wrapper)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ReadingRoomLeaderboard } from "@/components/reading-room/reading-room-leaderboard";

export default async function ReadingRoomLeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <ReadingRoomLeaderboard />;
}
