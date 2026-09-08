"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, Award, Sparkles, Flame, CheckCircle2, MapPin, ChevronRight } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface Tournament {
  id: string;
  titleBn: string;
  subject: string;
  dateStr: string;
  duration: string;
  participants: number;
  prizePoolXp: number;
  status: "upcoming" | "live" | "completed";
}

const TOURNAMENTS: Tournament[] = [
  {
    id: "tour-phy-1",
    titleBn: "জাতীয় বিজ্ঞান অলিম্পিয়াড ২০২৬ — পদার্থবিজ্ঞান ১ম পর্ব",
    subject: "পদার্থবিজ্ঞান ১ম ও ২য় পত্র",
    dateStr: "আগামী শুক্রবার, রাত ৯:০০ টা",
    duration: "৪৫ মিনিট (৫০ টি প্রশ্ন)",
    participants: 1420,
    prizePoolXp: 5000,
    status: "upcoming",
  },
  {
    id: "tour-math-1",
    titleBn: "অল বাংলাদেশ ক্যালকুলাস ও কনিক্স ব্লিটজ",
    subject: "উচ্চতর গণিত ১ম ও ২য় পত্র",
    dateStr: "লাইভ চলছে!",
    duration: "৩০ মিনিট (৩৫ টি প্রশ্ন)",
    participants: 2890,
    prizePoolXp: 7500,
    status: "live",
  },
  {
    id: "tour-chem-1",
    titleBn: "জৈব রসায়ন ও পর্যায় সারণি মেগা কাপ",
    subject: "রসায়ন ১ম ও ২য় পত্র",
    dateStr: "গত শুক্রবার",
    duration: "৪০ মিনিট (৪০ টি প্রশ্ন)",
    participants: 3410,
    prizePoolXp: 5000,
    status: "completed",
  },
];

const DIVISION_CHAMPS = [
  { division: "ঢাকা বিভাগ", name: "তানভীর হাসান", college: "নটর ডেম কলেজ", score: "৪৯/৫০", time: "১৮ মিনিট" },
  { division: "চট্টগ্রাম বিভাগ", name: "আফরিন সুলতানা", college: "চট্টগ্রাম কলেজ", score: "৪৮/৫০", time: "২০ মিনিট" },
  { division: "রাজশাহী বিভাগ", name: "মাহমুদুল হক", college: "রাজশাহী কলেজ", score: "৪৭/৫০", time: "২১ মিনিট" },
  { division: "খুলনা বিভাগ", name: "রাকিবুল ইসলাম", college: "এম এম কলেজ, যশোর", score: "৪৭/৫০", time: "২২ মিনিট" },
];

export function MegaOlympiadHub() {
  const [registeredIds, setRegisteredIds] = useState<string[]>(["tour-phy-1"]);

  const handleRegister = (tourId: string) => {
    sfx.play("correct");
    triggerConfetti();
    setRegisteredIds((prev) => [...prev, tourId]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-amber-500/10 via-card to-rose-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Trophy className="h-6 w-6 animate-bounce" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>অল-বাংলাদেশ মেগা অলিম্পিয়াড ও টুর্নামেন্ট হাব</span>
                  <Badge variant="secondary" className="text-xs">
                    🏆 National Grand League
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  সারা দেশের সেরা শিক্ষার্থীদের সাথে লাইভ টুর্নামেন্টে অংশ নিন এবং জাতীয় স্কলারশিপ ব্যাজ জিতুন
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOURNAMENTS.map((tour) => {
          const isRegistered = registeredIds.includes(tour.id);

          return (
            <Card
              key={tour.id}
              className={cn(
                "border transition-all duration-200 relative overflow-hidden flex flex-col justify-between",
                tour.status === "live"
                  ? "border-rose-500 ring-2 ring-rose-500/30 bg-rose-500/5 shadow-md"
                  : "bg-card hover:border-primary/40"
              )}
            >
              <CardHeader className="p-4 sm:p-5 pb-2">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge
                    variant={tour.status === "live" ? "default" : "secondary"}
                    className={cn(
                      "text-2xs font-bold",
                      tour.status === "live" && "bg-rose-500 text-white animate-pulse"
                    )}
                  >
                    {tour.status === "live" ? "🔴 লাইভ চলছে" : tour.status === "upcoming" ? "📅 আসন্ন মেগা ইভেন্ট" : "সমাপ্ত"}
                  </Badge>
                  <span className="font-mono font-bold text-amber-500 text-xs flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    +{tour.prizePoolXp} XP
                  </span>
                </div>

                <CardTitle className="text-base font-bold text-foreground">
                  {tour.titleBn}
                </CardTitle>
                <p className="text-2xs text-muted-foreground">{tour.subject}</p>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-2 space-y-3">
                <div className="rounded-xl bg-muted/30 p-2.5 text-2xs space-y-1 font-medium">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>{tour.dateStr}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{tour.participants} জন নিবন্ধিত</span>
                  </div>
                </div>

                {tour.status === "live" ? (
                  <Button className="w-full gap-2 font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md animate-pulse">
                    <Flame className="h-4 w-4" />
                    <span>এখনই যোগ দিন</span>
                  </Button>
                ) : isRegistered ? (
                  <Button variant="outline" className="w-full gap-1 text-xs border-emerald-500 text-emerald-600 font-bold" disabled>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>নিবন্ধন সম্পন্ন হয়েছে</span>
                  </Button>
                ) : (
                  <Button onClick={() => handleRegister(tour.id)} className="w-full font-bold">
                    <span>ফ্রি রেজিস্ট্রেশন করুন</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Division Hall of Fame */}
      <Card className="border shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <span>বিভাগীয় চ্যাম্পিয়ন হল অফ ফেম (Division Hall of Fame)</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DIVISION_CHAMPS.map((champ, idx) => (
              <div key={idx} className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-3xs font-bold text-primary flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {champ.division}
                  </Badge>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {champ.score}
                  </span>
                </div>

                <div>
                  <div className="font-bold text-sm text-foreground">{champ.name}</div>
                  <div className="text-2xs text-muted-foreground">{champ.college}</div>
                </div>

                <div className="text-3xs text-muted-foreground font-mono">
                  সময়: {champ.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
