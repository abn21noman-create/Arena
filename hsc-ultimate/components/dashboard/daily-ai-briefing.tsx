"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  Target,
  BookOpen,
  Volume2,
} from "lucide-react";
import { VoiceReadoutButton } from "@/components/shared/voice-readout-button";

interface ActionFocusItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  href: string;
  actionText: string;
}

const DEFAULT_ACTIONS: ActionFocusItem[] = [
  {
    id: "action-1",
    tag: "দুর্বলতা নিরাময়",
    title: "পদার্থবিজ্ঞান ২য়: তাপগতিবিদ্যার ভুল প্রশ্ন রিভিশন",
    subtitle: "মিস্টেক ভল্টে থাকা ৩টি প্রশ্ন পুনরায় সমাধান করে কনসেপ্ট ক্লিয়ার করো",
    href: "/mistake-vault",
    actionText: "ভল্ট খোলো",
  },
  {
    id: "action-2",
    tag: "কনসেপ্ট ড্রিল",
    title: "রসায়ন ১ম: দ্রাব্যতা গুণফল ও আয়নিক গুণফলের সূত্র",
    subtitle: "বোর্ড পরীক্ষার জন্য সবচেয়ে গুরুত্বপূর্ণ ৪টি গাণিতিক ফর্মুলা ঝালিয়ে নাও",
    href: "/formula-search",
    actionText: "সূত্র দেখো",
  },
  {
    id: "action-3",
    tag: "স্পিড বুস্ট",
    title: "উচ্চতর গণিত ১ম: লিমিট ও অন্তরীকরণের ১৫ মিনিটের কুইজ",
    subtitle: "কুইজ ব্যাটলে বন্ধুদের সাথে স্পিড টেস্ট করে লিডারবোর্ডে এগিয়ে যাও",
    href: "/quiz-battle",
    actionText: "ব্যাটল শুরু করো",
  },
];

export function DailyAIBriefing({
  userName = "HSC পরীক্ষার্থী",
  actions = DEFAULT_ACTIONS,
}: {
  userName?: string;
  actions?: ActionFocusItem[];
}) {
  const briefingVoiceText = `শুভ সকাল ${userName}। তোমার সাম্প্রতিক পারফরম্যান্স বিশ্লেষণ করে আজকের জন্য তিনটি অগ্রাধিকার নির্ধারণ করা হয়েছে। প্রথমত, পদার্থবিজ্ঞান দ্বিতীয় পত্রের তাপগতিবিদ্যার ভুল প্রশ্ন রিভিশন। দ্বিতীয়ত, রসায়ন প্রথম পত্রের দ্রাব্যতা গুণফলের সূত্রাবলী। এবং তৃতীয়ত, গণিতের ১৫ মিনিটের স্পিড কুইজ। লক্ষ্য পূরণে এখনই শুরু করো।`;

  return (
    <Card className="overflow-hidden border bg-gradient-to-br from-card via-card to-primary/5 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <span>আজকের মর্নিং এআই স্টাডি ব্রিফিং</span>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Sparkles className="h-3 w-3 text-primary" />
                  AI Coach
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                তোমার দুর্বলতা ও লক্ষ্যের ওপর ভিত্তি করে আজকের সর্বোচ্চ ফলদায়ক ৩টি টাস্ক
              </CardDescription>
            </div>
          </div>
          <VoiceReadoutButton
            text={briefingVoiceText}
            variant="outline"
            className="h-8 gap-1.5 px-2.5 text-xs"
            label="ব্রিফিং শুনুন"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {actions.map((act) => (
            <div
              key={act.id}
              className="flex flex-col justify-between rounded-xl border bg-card p-3 shadow-2xs transition hover:border-primary/50 hover:bg-muted/20"
            >
              <div className="space-y-1.5">
                <Badge variant="outline" className="text-xs font-semibold text-primary">
                  {act.tag}
                </Badge>
                <h4 className="text-xs font-bold text-foreground leading-snug">
                  {act.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {act.subtitle}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t flex justify-end">
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10" asChild>
                  <Link href={act.href}>
                    <span>{act.actionText}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
