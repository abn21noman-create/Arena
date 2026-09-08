"use client";

// ===================================================================
// Public Profile Tab — Settings পেজে নতুন ট্যাব
// -------------------------------------------------------------------
// ইউজার নিজের badge/streak/XP পাবলিক লিংকে (/u/[slug]) শেয়ার করতে
// চাইলে এখান থেকে চালু করে, প্রোফাইল নাম (slug) বেছে নেয়।
// ===================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import { Loader2, Globe, ExternalLink, Copy, Check } from "lucide-react";

export function PublicProfileTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [slug, setSlug] = useState("");
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — কীবোর্ড/স্ক্রিন-রিডার ইউজারদের জন্য
  // aria-invalid+aria-describedby দিয়ে ইনলাইন ফিডব্যাক (আগে শুধু toast এ ছিল)
  const [slugError, setSlugError] = useState<string | undefined>();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/public-profile");
        const data = await res.json();
        setEnabled(data.enabled ?? false);
        setSlug(data.slug ?? "");
        setSavedSlug(data.slug ?? null);
      } catch {
        toast.error("প্রোফাইল তথ্য লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  function validateSlug() {
    const trimmed = slug.trim();
    if (!trimmed) {
      setSlugError("একটা প্রোফাইল নাম দাও");
      return false;
    }
    if (trimmed.length < 3 || trimmed.length > 30) {
      setSlugError("প্রোফাইল নাম ৩-৩০ অক্ষরের হতে হবে");
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(trimmed)) {
      setSlugError("শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা, হাইফেন ব্যবহার করো");
      return false;
    }
    setSlugError(undefined);
    return true;
  }

  async function handleSaveSlug() {
    if (!validateSlug()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/public-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "সেভ করা যায়নি");
        return;
      }
      setSavedSlug(data.slug);
      setSlug(data.slug ?? "");
      toast.success("প্রোফাইল নাম সেভ হয়েছে!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(next: boolean) {
    if (next && !savedSlug) {
      toast.error("চালু করার আগে প্রথমে একটা প্রোফাইল নাম সেভ করো");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/public-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "পরিবর্তন করা যায়নি");
        return;
      }
      setEnabled(data.enabled);
      toast.success(next ? "পাবলিক প্রোফাইল চালু হয়েছে!" : "পাবলিক প্রোফাইল বন্ধ হয়েছে");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    const url = `${window.location.origin}/u/${savedSlug}`;
    const ok = await copyToClipboard(url);
    if (!ok) {
      toast.error("কপি করা যায়নি, ম্যানুয়ালি লিংক সিলেক্ট করে কপি করো");
      return;
    }
    setCopied(true);
    toast.success("লিংক কপি হয়েছে!");
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <Card className="p-6 h-48 animate-pulse bg-muted/30" />;
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-4 w-4 text-primary" />
            <Label className="font-medium text-sm">পাবলিক প্রোফাইল</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            তোমার Level/Streak/Badge একটা শেয়ারযোগ্য লিংকে দেখাও (ডিফল্টে বন্ধ)
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} disabled={saving} />
      </Card>

      <Card className="p-5 space-y-3">
        <div>
          <Label htmlFor="slug" className="text-sm font-medium">
            প্রোফাইল নাম (URL)
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা, হাইফেন (৩-৩০ অক্ষর)
          </p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center rounded-lg border overflow-hidden">
              <span className="px-3 text-xs text-muted-foreground bg-muted/50 h-full flex items-center py-2.5 shrink-0">
                /u/
              </span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase());
                  if (slugError) setSlugError(undefined);
                }}
                placeholder="rafi-hsc28"
                className="border-0 rounded-none"
                aria-invalid={!!slugError}
                aria-describedby={slugError ? "slug-error" : undefined}
              />
            </div>
            <Button onClick={handleSaveSlug} disabled={saving || slug === savedSlug}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              সেভ
            </Button>
          </div>
          {slugError && (
            <p id="slug-error" role="alert" className="text-xs text-destructive mt-1.5">
              {slugError}
            </p>
          )}
        </div>

        {savedSlug && enabled && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
            <Link
              href={`/u/${savedSlug}`}
              target="_blank"
              className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
            >
              {typeof window !== "undefined" ? window.location.origin : ""}/u/{savedSlug}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </Link>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={handleCopy}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                    aria-label="লিংক কপি করো"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                }
              />
              <TooltipContent>লিংক কপি করো</TooltipContent>
            </Tooltip>
          </div>
        )}
      </Card>
    </div>
  );
}
