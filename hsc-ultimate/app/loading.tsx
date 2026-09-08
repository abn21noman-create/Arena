import { Brain } from "lucide-react";
import { PremiumLoading } from "@/components/ui/premium-loading";

export default function GlobalLoading() {
  return (
    <PremiumLoading
      icon={Brain}
      eyebrow="HSC ULTIMATE · PERSONAL LEARNING OS"
      title="আপনার learning universe প্রস্তুত হচ্ছে"
      subtitle="Secure session, study progress, personalized tools এবং focus settings একসাথে sync হচ্ছে।"
      accent="violet"
      tip="আজকের ২৫ মিনিটের focused session আগামী পরীক্ষার confidence তৈরি করে।"
      steps={[
        { label: "Secure account", detail: "Session ও privacy preference যাচাই হচ্ছে" },
        { label: "Sync mastery", detail: "XP, streak ও topic progress আনা হচ্ছে" },
        { label: "Personalize", detail: "আপনার জন্য relevant module সাজানো হচ্ছে" },
      ]}
    />
  );
}
