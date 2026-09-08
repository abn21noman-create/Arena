"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

interface UseExamHallProctorProps {
  enabled?: boolean;
  maxStrikes?: number;
  onAutoSubmit?: () => void;
}

export function useExamHallProctor({
  enabled = true,
  maxStrikes = 3,
  onAutoSubmit,
}: UseExamHallProctorProps = {}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Fullscreen change listener
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const triggerViolation = useCallback(
    (reason: string) => {
      if (!enabled) return;

      sfx.play("warning");
      setStrikes((prev) => {
        const next = prev + 1;
        if (next >= maxStrikes) {
          toast.error("সর্বোচ্চ ৩টি স্ট্রাইক সীমা অতিক্রম হয়েছে! পরীক্ষা স্বয়ংক্রিয়ভাবে জমা দেওয়া হচ্ছে...", {
            duration: 6000,
          });
          onAutoSubmit?.();
        } else {
          toast.warning(`সতর্কতা: ${reason} (স্ট্রাইক: ${next}/${maxStrikes})`, {
            duration: 4000,
          });
          setShowWarningModal(true);
        }
        return next;
      });
    },
    [enabled, maxStrikes, onAutoSubmit]
  );

  // Visibility and blur tracking
  useEffect(() => {
    if (!enabled) return;

    function handleVisibilityChange() {
      if (document.hidden) {
        triggerViolation("পরীক্ষার সময় অন্য ট্যাবে যাওয়া নিষেধ!");
      }
    }

    function handleWindowBlur() {
      // Optional subtle warning on focus loss
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [enabled, triggerViolation]);

  const toggleFullscreen = useCallback(async () => {
    sfx.play("click");
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        toast.success("🔒 ফুল-স্ক্রিন এক্সাম হল মোড চালু হয়েছে");
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      toast.error("ফুল-স্ক্রিন মোড চালু করা যায়নি");
    }
  }, []);

  return {
    isFullscreen,
    strikes,
    maxStrikes,
    showWarningModal,
    setShowWarningModal,
    toggleFullscreen,
  };
}

export function ExamHallModeToggle({
  isFullscreen,
  strikes,
  maxStrikes = 3,
  onToggle,
}: {
  isFullscreen: boolean;
  strikes: number;
  maxStrikes?: number;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {strikes > 0 && (
        <Badge
          variant="destructive"
          className="gap-1 text-xs animate-bounce"
        >
          <ShieldAlert className="h-3 w-3" />
          <span>স্ট্রাইক {strikes}/{maxStrikes}</span>
        </Badge>
      )}

      <Button
        type="button"
        variant={isFullscreen ? "default" : "outline"}
        size="sm"
        className={cn(
          "h-8 gap-1.5 text-xs transition",
          isFullscreen && "bg-emerald-600 hover:bg-emerald-700 text-white"
        )}
        onClick={onToggle}
        title={isFullscreen ? "ফুল-স্ক্রিন মোড বন্ধ করুন" : "ফুল-স্ক্রিন এক্সাম হল মোড"}
      >
        {isFullscreen ? (
          <>
            <Minimize2 className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">এক্সাম হল অ্যাক্টিভ</span>
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span className="hidden xs:inline">এক্সাম হল মোড</span>
          </>
        )}
      </Button>
    </div>
  );
}
