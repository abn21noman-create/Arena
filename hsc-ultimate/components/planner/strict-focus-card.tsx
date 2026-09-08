import Link from "next/link";
import { LockKeyhole, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StrictFocusCard() {
  return (
    <Link href="/focus" className="block h-full">
      <Card className="h-full border-violet-500/30 p-5 transition-colors hover:border-violet-500/60 hover:bg-violet-500/5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
          <LockKeyhole className="h-5 w-5 text-violet-500" />
        </div>
        <h3 className="font-bold">Strict Focus</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          ২০ মিনিট–২ ঘণ্টা Deep Study। Android-এ distracting app block এবং consent-based Admin session।
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Focus settings <ArrowRight className="h-4 w-4" />
        </span>
      </Card>
    </Link>
  );
}
