import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { WaveOpticsLab } from "@/components/lab/wave-optics-lab";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default async function WaveOpticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <AuroraBackground variant="subtle" className="min-h-screen">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <WaveOpticsLab />
      </div>
    </AuroraBackground>
  );
}
