"use client";

// ===================================================================
// Danger Zone Tab — Settings পেজে নতুন ট্যাব
// -------------------------------------------------------------------
// দুটো ফিচার: (১) Data Export — নিজের সব ডেটা JSON ফাইলে ডাউনলোড করা
// (২) Account Deletion — সম্পূর্ণ অ্যাকাউন্ট irreversibly মুছে ফেলা,
// পাসওয়ার্ড + নির্দিষ্ট টেক্সট টাইপ করে double-confirmation।
// ===================================================================
import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Trash2, Loader2, AlertTriangle } from "lucide-react";

const CONFIRMATION_TEXT = "ডিলিট করো";

export function DangerZoneTab() {
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/user/export-data");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "ডেটা এক্সপোর্ট করা যায়নি");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="(.+)"/);
      a.href = url;
      a.download = filenameMatch?.[1] ?? "hsc-ultimate-data-export.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("তোমার ডেটা ডাউনলোড হয়েছে!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    if (confirmText !== CONFIRMATION_TEXT) {
      toast.error(`নিশ্চিত করতে "${CONFIRMATION_TEXT}" ঠিক এভাবে টাইপ করো`);
      return;
    }
    if (!password) {
      toast.error("পাসওয়ার্ড দিতে হবে");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmationText: confirmText }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "অ্যাকাউন্ট ডিলিট করা যায়নি");
        return;
      }
      toast.success("তোমার অ্যাকাউন্ট মুছে ফেলা হয়েছে। বিদায়! 👋");
      await signOut({ redirectTo: "/login" });
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Data Export */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="rounded-lg bg-primary/10 p-2">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">তোমার ডেটা ডাউনলোড করো</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Profile, learning attempt, AI/PDF, Focus, community, device metadata ও policy acceptance-সহ account data JSON-এ পাবে। Password hash, reset token, raw push credential/vector এবং অন্য user-এর private identity export হবে না।
            </p>
          </div>
        </div>
        <Button onClick={handleExport} disabled={exporting} variant="outline" className="gap-2">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          ডেটা ডাউনলোড করো
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Export scope ও retention: <Link href="/privacy#data-controls" className="font-semibold text-primary hover:underline">Privacy Policy</Link>
        </p>
      </Card>

      {/* Account Deletion */}
      <Card className="p-6 border-destructive/50">
        <div className="flex items-start gap-3 mb-4">
          <div className="rounded-lg bg-destructive/10 p-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-semibold text-destructive">অ্যাকাউন্ট ডিলিট করো</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Account-linked learning, AI/PDF, Focus, community, push ও consent data স্থায়ীভাবে মুছে যাবে। Direct security/audit identifier scrub হলেও de-identified event fact legitimate security purpose-এ থাকতে পারে।
              <strong className="text-foreground"> এটা ফেরানো যাবে না।</strong>
            </p>
          </div>
        </div>

        <Dialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) {
              setPassword("");
              setConfirmText("");
            }
          }}
        >
          <DialogTrigger
            render={
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                অ্যাকাউন্ট ডিলিট করো
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                নিশ্চিত ভাবে ডিলিট করতে চাও?
              </DialogTitle>
              <DialogDescription>
                এই কাজটা স্থায়ী এবং ফেরানো যাবে না। নিশ্চিত হতে নিচে পাসওয়ার্ড
                ও নির্দিষ্ট টেক্সট লিখো।
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="delete-password">তোমার পাসওয়ার্ড</Label>
                <PasswordInput
                  id="delete-password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড দাও"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="delete-confirm">
                  নিশ্চিত করতে ঠিক এভাবে টাইপ করো: <strong>{CONFIRMATION_TEXT}</strong>
                </Label>
                <Input
                  id="delete-confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={CONFIRMATION_TEXT}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose render={<Button variant="outline">বাতিল</Button>} />
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleting || confirmText !== CONFIRMATION_TEXT || !password}
                className="gap-2"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                স্থায়ীভাবে ডিলিট করো
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <p className="mt-3 text-xs text-muted-foreground">
          বিস্তারিত ও web-only নির্দেশনা: <Link href="/account-deletion" className="font-semibold text-primary hover:underline">Account deletion guide</Link>
        </p>
      </Card>
    </div>
  );
}
