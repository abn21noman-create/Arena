/**
 * Admin Broadcast Page
 * ---------------------------------------------------------
 * Real-time notification broadcast to users.
 * Features:
 *   - Compose: title, body, link, icon
 *   - Targeting: all/by role/by subject/by streak/by batch
 *   - Preview: see audience size before sending
 *   - Templates: save & reuse common broadcasts
 *   - History: past campaigns with delivery stats
 *   - Active channels: in-app and configured web push
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Megaphone, Send, Users, Eye, History, BookmarkIcon,
  Loader2, CheckCircle2, XCircle, Filter, Sparkles, Trash2
} from "lucide-react";

type TargetType = "ALL_USERS" | "BY_ROLE" | "BY_SUBJECT" | "BY_STREAK" | "BY_HSC_BATCH";

interface BroadcastCampaign {
  id: string;
  title: string;
  body: string;
  link: string | null;
  icon: string | null;
  targetType: TargetType;
  targetFilter: Record<string, unknown> | null;
  status: "DRAFT" | "SENDING" | "COMPLETED" | "FAILED";
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  readCount: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  sentById: string | null;
}

interface BroadcastTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  link: string | null;
  icon: string | null;
  targetType: TargetType;
  variables: string[] | null;
  usageCount: number;
}

const ICONS = ["📚", "📝", "🎉", "⚠️", "🔥", "⏰", "✅", "🚀", "💡", "🏆", "🎯", "📢"];

export default function BroadcastPage() {
  const [activeTab, setActiveTab] = useState<"compose" | "history" | "templates">("compose");

  // Compose form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [icon, setIcon] = useState("📚");
  const [targetType, setTargetType] = useState<TargetType>("ALL_USERS");
  const [filter, setFilter] = useState<{
    role?: string;
    subjectCode?: string;
    streakMin?: number;
    hscBatch?: number;
  }>({});

  const [sendInApp, setSendInApp] = useState(true);
  const [sendPush, setSendPush] = useState(false);

  // Preview & send state
  const [audienceSize, setAudienceSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // History
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<BroadcastTemplate[]>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const previewAudience = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        preview: "true",
        targetType,
        ...(Object.keys(filter).length > 0 ? { targetFilter: JSON.stringify(filter) } : {}),
      });
      const res = await fetch(`/api/admin/broadcast?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAudienceSize(data.audienceSize);
      }
    } catch (error) {
      console.error("Preview error:", error);
    } finally {
      setLoading(false);
    }
  }, [targetType, filter]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/admin/broadcast?limit=50");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error("History error:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/broadcast/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Templates error:", error);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
    void loadTemplates();
  }, [loadHistory, loadTemplates]);

  useEffect(() => {
    if (title && targetType) void previewAudience();
    else setAudienceSize(null);
  }, [previewAudience, targetType, title]);

  const handleSend = async () => {
    if (!title || !body) {
      toast.error("Title and body required");
      return;
    }
    if (!sendInApp && !sendPush) {
      toast.error("অন্তত একটি বাস্তব delivery channel নির্বাচন করুন");
      return;
    }
    if (!confirm(`Send broadcast to ${audienceSize ?? 0} users?`)) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          link: link || undefined,
          icon,
          targetType,
          targetFilter: filter,
          sendInApp,
          sendPush,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send");
      }
      const result = await res.json();
      toast.success(`✅ ${result.sentCount}/${result.totalRecipients} user-এর অন্তত একটি channel-এ delivery হয়েছে`);
      // Reset form
      setTitle("");
      setBody("");
      setLink("");
      void loadHistory();
    } catch (e) {
      toast.error(`Failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (t: BroadcastTemplate) => {
    setTitle(t.title);
    setBody(t.body);
    setLink(t.link ?? "");
    setIcon(t.icon ?? "📚");
    setTargetType(t.targetType);
    setActiveTab("compose");
    toast.success(`Template "${t.name}" applied`);
  };

  const saveAsTemplate = async () => {
    if (!title || !body) {
      toast.error("Title and body required");
      return;
    }
    const name = prompt("Template name?");
    if (!name) return;
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/admin/broadcast/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          title,
          body,
          link: link || null,
          icon,
          targetType,
        }),
      });
      if (res.ok) {
        toast.success("Template saved!");
        void loadTemplates();
      }
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSavingTemplate(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      const res = await fetch(`/api/admin/broadcast/templates?id=${id}`, { method: "DELETE" });
      if (res.ok) void loadTemplates();
    } catch {}
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-primary" />
            Broadcast Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Send real-time push notifications to users. Targeting, multi-channel delivery, templates.
          </p>
        </div>
        {audienceSize !== null && (
          <Badge variant="secondary" className="text-sm px-3 py-1.5">
            <Users className="h-4 w-4 mr-1.5" />
            {audienceSize.toLocaleString()} recipients
          </Badge>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (value === "compose" || value === "history" || value === "templates") {
            setActiveTab(value);
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="compose"><Send className="h-4 w-4 mr-1.5" />Compose</TabsTrigger>
          <TabsTrigger value="history"><History className="h-4 w-4 mr-1.5" />History</TabsTrigger>
          <TabsTrigger value="templates"><BookmarkIcon className="h-4 w-4 mr-1.5" />Templates</TabsTrigger>
        </TabsList>

        {/* COMPOSE TAB */}
        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
              <CardDescription>Write your notification. Users will see this in real-time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="পরীক্ষার ১ দিন বাকি!"
                  maxLength={200}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">{title.length}/200</p>
              </div>

              {/* Body */}
              <div>
                <Label htmlFor="body">Body <span className="text-destructive">*</span></Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="কাল পদার্থবিজ্ঞান পরীক্ষা। শেষ রিভিশন করো।"
                  maxLength={1000}
                  rows={4}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">{body.length}/1000</p>
              </div>

              {/* Link + Icon */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="link">Link (optional)</Label>
                  <Input
                    id="link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="/dashboard বা https://..."
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Icon</Label>
                  <Select value={icon} onValueChange={(value) => value && setIcon(value)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICONS.map((i) => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Target Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Who should receive this?</Label>
                <Select value={targetType} onValueChange={(value) => value && setTargetType(value as TargetType)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_USERS">👥 All Users (everyone)</SelectItem>
                    <SelectItem value="BY_ROLE">🎭 By Role (Student/Admin)</SelectItem>
                    <SelectItem value="BY_SUBJECT">📚 By Subject (bookmarked/practiced)</SelectItem>
                    <SelectItem value="BY_STREAK">🔥 By Streak (engaged learners)</SelectItem>
                    <SelectItem value="BY_HSC_BATCH">🎓 By HSC Batch (year)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Inputs */}
              <AnimatePresence mode="wait">
                {targetType === "BY_ROLE" && (
                  <motion.div key="role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Label>Role</Label>
                    <Select value={filter.role || "STUDENT"} onValueChange={(value) => value && setFilter({ ...filter, role: value })}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}

                {targetType === "BY_SUBJECT" && (
                  <motion.div key="subject" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Label>Subject</Label>
                    <Select value={filter.subjectCode || ""} onValueChange={(value) => value && setFilter({ ...filter, subjectCode: value })}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PHYSICS">⚛️ Physics</SelectItem>
                        <SelectItem value="CHEMISTRY">🧪 Chemistry</SelectItem>
                        <SelectItem value="BIOLOGY">🧬 Biology</SelectItem>
                        <SelectItem value="HIGHER_MATH">➗ Higher Math</SelectItem>
                        <SelectItem value="BANGLA">🇧🇩 Bangla</SelectItem>
                        <SelectItem value="ENGLISH">🔤 English</SelectItem>
                        <SelectItem value="ICT">💻 ICT</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}

                {targetType === "BY_STREAK" && (
                  <motion.div key="streak" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Label>Minimum streak (days)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={filter.streakMin || ""}
                      onChange={(e) => setFilter({ ...filter, streakMin: parseInt(e.target.value) || 0 })}
                      placeholder="e.g. 3"
                      className="mt-1.5"
                    />
                  </motion.div>
                )}

                {targetType === "BY_HSC_BATCH" && (
                  <motion.div key="batch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Label>HSC Batch Year</Label>
                    <Input
                      type="number"
                      min={2020}
                      max={2030}
                      value={filter.hscBatch || ""}
                      onChange={(e) => setFilter({ ...filter, hscBatch: parseInt(e.target.value) || 2028 })}
                      placeholder="e.g. 2028"
                      className="mt-1.5"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Channels</CardTitle>
              <CardDescription>Choose how to deliver this notification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>In-App Notification</Label>
                  <p className="text-xs text-muted-foreground">Bell icon, persists until read</p>
                </div>
                <Switch checked={sendInApp} onCheckedChange={setSendInApp} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Web Push (Browser)</Label>
                  <p className="text-xs text-muted-foreground">Native browser notification</p>
                </div>
                <Switch checked={sendPush} onCheckedChange={setSendPush} />
              </div>
              <p className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-muted-foreground">
                Email ও generic Android FCM broadcast এখনো বাস্তব delivery pipeline নয়, তাই সেগুলো দেখানো বা delivered হিসেবে গণনা করা হচ্ছে না।
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={previewAudience} variant="outline" disabled={loading}>
              <Eye className="h-4 w-4 mr-2" />
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Preview Audience"}
            </Button>
            <Button onClick={saveAsTemplate} variant="outline" disabled={savingTemplate || !title || !body}>
              <BookmarkIcon className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
            <Button onClick={handleSend} disabled={sending || !title || !body || (!sendInApp && !sendPush)} className="ml-auto">
              {sending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Broadcast {audienceSize !== null && `to ${audienceSize}`}
            </Button>
          </div>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="space-y-3">
          {historyLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No broadcasts yet. Send your first one!</p>
              </CardContent>
            </Card>
          ) : (
            campaigns.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{c.icon || "📢"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{c.title}</h3>
                        {c.status === "COMPLETED" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {c.status === "SENDING" && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                        {c.status === "FAILED" && <XCircle className="h-4 w-4 text-red-500" />}
                        <Badge variant="outline" className="text-xs">{c.targetType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{c.body}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>📤 {c.sentCount}/{c.totalRecipients} delivered</span>
                        {c.readCount > 0 && <span>👁️ {c.readCount} read</span>}
                        {c.failedCount > 0 && <span className="text-red-500">❌ {c.failedCount} failed</span>}
                        <span>📅 {new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="space-y-3">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No templates yet. Save a broadcast as template!</p>
              </CardContent>
            </Card>
          ) : (
            templates.map((t) => (
              <Card key={t.id} className="hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{t.icon || "📚"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{t.name}</h3>
                        <Badge variant="secondary" className="text-xs">Used {t.usageCount}×</Badge>
                      </div>
                      <p className="text-sm font-medium mt-1">{t.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.body}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={() => applyTemplate(t)}>Use</Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteTemplate(t.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
