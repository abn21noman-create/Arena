import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PhotosynthesisBioenergeticsLab } from "@/components/learn/photosynthesis-lab";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default async function PhotosynthesisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <AuroraBackground variant="subtle" className="min-h-screen">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <PhotosynthesisBioenergeticsLab />
      </div>
    </AuroraBackground>
  );
}
