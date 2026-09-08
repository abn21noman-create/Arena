import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { StudyWhiteboard } from "@/components/study-group/study-whiteboard";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default async function WhiteboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <AuroraBackground variant="subtle" className="min-h-screen">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <StudyWhiteboard />
      </div>
    </AuroraBackground>
  );
}
