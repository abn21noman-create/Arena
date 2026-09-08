"use client";

// ===================================================================
// Admission Mock Test History — আগের সব attempt এর তালিকা, examType
// ফিল্টার সহ (progress ট্র্যাক করার জন্য)
// ===================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdmissionExamType } from "@prisma/client";

const EXAM_LABELS: Record<string, string> = {
  MEDICAL: "মেডিকেল",
  DU_A_UNIT: "DU 'ক' ইউনিট",
  BUET: "বুয়েট প্র্যাকটিস",
};

interface AttemptHistoryItem {
  id: string;
  examType: AdmissionExamType;
  rawScore: number | null;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeTakenSec: number | null;
  completedAt: string;
}

export function AdmissionHistory() {
  const [attempts, setAttempts] = useState<AttemptHistoryItem[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = filter === "ALL" ? "/api/admission/history" : `/api/admission/history?examType=${filter}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setAttempts(data.attempts ?? []))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <History className="h-5 w-5 text-primary" />
        Admission Mock Test ইতিহাস
      </h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {["ALL", "MEDICAL", "BUET", "DU_A_UNIT"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input hover:bg-muted"
            )}
          >
            {f === "ALL" ? "সব" : EXAM_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : attempts.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          এখনো কোনো মক টেস্ট দাওনি। আজই শুরু করো!
        </p>
      ) : (
        <div className="space-y-2">
          {attempts.map((a) => (
            <Link key={a.id} href={`/admission/result/${a.id}`}>
              <Card className="p-4 hover-lift cursor-pointer">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {EXAM_LABELS[a.examType]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.completedAt).toLocaleDateString("bn-BD", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      সঠিক {a.correctCount} • ভুল {a.wrongCount} • বাদ {a.skippedCount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="font-bold">
                        {a.rawScore} / {a.maxScore}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
