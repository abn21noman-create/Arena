"use client";

// ===================================================================
// PDF Chat Dashboard — আপলোড করা PDF এর লিস্ট + নতুন আপলোড ফর্ম
// -------------------------------------------------------------------
// PROCESSING স্ট্যাটাসের ডকুমেন্টের জন্য পোলিং করা হয় (৩ সেকেন্ড interval)
// যতক্ষণ না READY/FAILED হয়, যাতে ইউজার লাইভ প্রগ্রেস দেখতে পায়।
// ===================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Upload,
  Loader2,
  MessageSquare,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";

type DocStatus = "PROCESSING" | "READY" | "FAILED";

interface PdfDoc {
  id: string;
  title: string;
  originalFileName: string;
  pageCount: number;
  totalChunks: number;
  status: DocStatus;
  errorMessage: string | null;
  createdAt: string;
}

const STATUS_INFO: Record<DocStatus, { label: string; icon: typeof Clock; className: string }> = {
  PROCESSING: { label: "প্রসেসিং হচ্ছে...", icon: Clock, className: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30" },
  READY: { label: "প্রস্তুত", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30" },
  FAILED: { label: "ব্যর্থ হয়েছে", icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 dark:border-red-500/30" },
};

export function PdfChatDashboard() {
  const confirmAction = useConfirmDialog();
  const [documents, setDocuments] = useState<PdfDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/pdf-chat");
      const data = await res.json();
      if (res.ok) setDocuments(data.documents);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  // যতক্ষণ কোনো ডকুমেন্ট PROCESSING অবস্থায় আছে, ততক্ষণ পোলিং চালু রাখা
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "PROCESSING");
    if (hasProcessing && !pollRef.current) {
      pollRef.current = setInterval(() => {
        void loadDocuments();
      }, 3000);
    } else if (!hasProcessing && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [documents, loadDocuments]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("শুধু PDF ফাইল আপলোড করা যাবে");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("ফাইলের সাইজ ১৫ MB এর বেশি হতে পারবে না");
      return;
    }
    setSelectedFile(file);
    if (!title) setTitle(file.name.replace(/\.pdf$/i, ""));
  }

  async function handleUpload() {
    if (!selectedFile || uploading) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", title);

      const res = await fetch("/api/pdf-chat", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "আপলোড ব্যর্থ হয়েছে");
        return;
      }
      toast.success("📄 PDF আপলোড হয়েছে! প্রসেসিং শুরু হয়েছে...");
      setSelectedFile(null);
      setTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      void loadDocuments();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId: string) {
    if (
      !(await confirmAction({
        description: "এই PDF ও এর সব চ্যাট হিস্ট্রি ডিলিট হয়ে যাবে, নিশ্চিত?",
        confirmLabel: "ডিলিট করো",
      }))
    )
      return;
    try {
      const res = await fetch(`/api/pdf-chat/${docId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "ডিলিট করা যায়নি");
        return;
      }
      toast.success("ডিলিট হয়েছে");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <div>
          <h1 className="text-2xl font-bold">📚 PDF চ্যাট</h1>
          <p className="text-sm text-muted-foreground">
            তোমার নিজের নোট বা বইয়ের PDF আপলোড করো, AI সেটা পড়ে তোমার প্রশ্নের উত্তর দেবে
          </p>
        </div>
      </div>

      {/* glassmorphism hero banner — established প্যাটার্ন (nav-modules.ts এর
          PDF Chat আইটেম গ্রেডিয়েন্ট) */}
      <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-fuchsia-700 to-violet-700 p-5 mb-6 text-white">
        <div
          aria-hidden
          className="glass-hero-orb h-32 w-32 bg-white/20"
          style={{ top: "-2rem", right: "-1.5rem" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div>
            <p className="font-bold">নিজের নোট/বই দিয়ে AI চ্যাট</p>
            <p className="text-sm opacity-90">PDF আপলোড করে সরাসরি সেখান থেকে প্রশ্ন করো</p>
          </div>
        </div>
      </div>

      {/* Upload Card */}
      <Card className="mb-6 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <Upload className="h-5 w-5 text-violet-600" />
          নতুন PDF আপলোড করো
        </h2>
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs leading-5 text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
          <p>
            Original PDF binary persist হয় না; extracted text/chunks database-এ থাকে এবং embedding/answer-এর জন্য Mistral/configured AI provider-এ যায়। Permission/copyright নেই বা sensitive data আছে এমন file দিও না। <Link href="/privacy#pdf-processing" className="font-semibold text-primary hover:underline">Data flow</Link>
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="pdf-file">PDF ফাইল (সর্বোচ্চ ১৫ MB)</Label>
            <Input
              id="pdf-file"
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </div>
          {selectedFile && (
            <div>
              <Label htmlFor="pdf-title">টাইটেল (ঐচ্ছিক)</Label>
              <Input
                id="pdf-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: পদার্থবিজ্ঞান ১ম পত্র - অধ্যায় ২"
                disabled={uploading}
              />
            </div>
          )}
          <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full sm:w-auto">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> আপলোড হচ্ছে...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> আপলোড করো
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Document List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p>এখনো কোনো PDF আপলোড করোনি। উপরের ফর্ম দিয়ে শুরু করো!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const statusInfo = STATUS_INFO[doc.status];
            const StatusIcon = statusInfo.icon;
            return (
              <Card key={doc.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <FileText className="h-8 w-8 shrink-0 text-violet-600 dark:text-violet-400" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{doc.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className={statusInfo.className}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                      {doc.status === "READY" && (
                        <span>
                          {doc.pageCount} পাতা • {doc.totalChunks} অংশ
                        </span>
                      )}
                      {doc.status === "FAILED" && doc.errorMessage && (
                        <span className="text-red-600">{doc.errorMessage}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {doc.status === "READY" && (
                    <Button render={<Link href={`/pdf-chat/${doc.id}`} />} size="sm">
                        <MessageSquare className="mr-1.5 h-4 w-4" /> চ্যাট করো
                      </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(doc.id)}
                    aria-label="ডকুমেন্ট মুছে ফেলো"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
