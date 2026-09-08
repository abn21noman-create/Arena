"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { speakText, stopSpeaking } from "@/lib/voice-reader";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound-effects";

interface VoiceReadoutButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "icon" | "default";
  variant?: "ghost" | "outline" | "default";
  label?: string;
}

export function VoiceReadoutButton({
  text,
  className,
  size = "icon",
  variant = "ghost",
  label,
}: VoiceReadoutButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!isSupported) return null;

  const handleToggle = () => {
    sfx.play("click");
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(
        text,
        () => setIsPlaying(false),
        () => setIsPlaying(false)
      );
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(
        "shrink-0 transition-colors",
        isPlaying && "text-primary animate-pulse bg-primary/10",
        className
      )}
      onClick={handleToggle}
      title={isPlaying ? "ভয়েস পড়া বন্ধ করুন" : "ভয়েসে শুনে নিন"}
      aria-label={isPlaying ? "ভয়েস পড়া বন্ধ করুন" : "ভয়েসে শুনে নিন"}
    >
      {isPlaying ? (
        <VolumeX className="h-4 w-4 text-primary" />
      ) : (
        <Volume2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      )}
      {label && <span className="ml-1.5 text-xs">{label}</span>}
    </Button>
  );
}
