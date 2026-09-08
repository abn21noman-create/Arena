"use client";

// ===================================================================
// Exam Day Checklist Mode — পরীক্ষার আগের রাত ও পরীক্ষার দিনের
// চেকলিস্ট (Admit Card, কলম-পেন্সিল, breathing exercise ইত্যাদি)
// -------------------------------------------------------------------
// established Habit Tracker এর একই CRUD+toggle প্যাটার্ন অনুসরণ করা
// হয়েছে। HSC পরীক্ষা একাধিক দিন ধরে চলে বলে "রিসেট" বাটন দিয়ে
// পরের পরীক্ষার দিনের জন্য আবার সব আনচেক করা যায়।
// ===================================================================
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Loader2,
  Check,
  RotateCcw,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Category = "NIGHT_BEFORE" | "EXAM_DAY";

interface ChecklistItem {
  id: string;
  category: Category;
  label: string;
  isChecked: boolean;
  isCustom: boolean;
}

const MAX_CUSTOM_ITEMS = 20;

export function ExamChecklistCard() {
  const confirmAction = useConfirmDialog();
  const [items, setItems] = useState<ChecklistItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("NIGHT_BEFORE");
  const [newLabel, setNewLabel] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch("/api/exam-checklist")
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(itemId: string, currentChecked: boolean) {
    setTogglingId(itemId);
    try {
      const res = await fetch(`/api/exam-checklist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isChecked: !currentChecked }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev
          ? prev.map((it) => (it.id === itemId ? { ...it, isChecked: !currentChecked } : it))
          : prev
      );
    } catch {
      toast.error("আপডেট করা যায়নি");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleAddItem() {
    if (!newLabel.trim()) {
      toast.error("আইটেমের নাম দাও");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/exam-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: activeCategory, label: newLabel.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "আইটেম যোগ করা যায়নি");
        return;
      }
      setItems((prev) => (prev ? [...prev, data.item] : [data.item]));
      setNewLabel("");
      setShowAddForm(false);
      toast.success("নতুন আইটেম যোগ হয়েছে!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(itemId: string) {
    if (
      !(await confirmAction({
        description: "এই আইটেম ডিলিট করতে চাও?",
        confirmLabel: "ডিলিট করো",
      }))
    )
      return;
    setDeletingId(itemId);
    try {
      const res = await fetch(`/api/exam-checklist/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => (prev ? prev.filter((it) => it.id !== itemId) : prev));
      toast.success("আইটেম ডিলিট হয়েছে");
    } catch {
      toast.error("ডিলিট করা যায়নি");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleReset() {
    if (
      !(await confirmAction({
        description: "সব আইটেম আনচেক হয়ে যাবে, পরের পরীক্ষার দিনের জন্য প্রস্তুত হবে। নিশ্চিত?",
        confirmLabel: "রিসেট করো",
        destructive: false,
      }))
    )
      return;
    setResetting(true);
    try {
      const res = await fetch("/api/exam-checklist/reset", { method: "POST" });
      if (!res.ok) throw new Error();
      setItems((prev) => (prev ? prev.map((it) => ({ ...it, isChecked: false })) : prev));
      toast.success("চেকলিস্ট রিসেট হয়েছে!");
    } catch {
      toast.error("রিসেট করা যায়নি");
    } finally {
      setResetting(false);
    }
  }

  const filteredItems = items?.filter((it) => it.category === activeCategory) ?? [];
  const customCount = items?.filter((it) => it.isCustom).length ?? 0;
  const checkedCount = filteredItems.filter((it) => it.isChecked).length;

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <ClipboardCheck className="h-4.5 w-4.5 text-primary" />
          পরীক্ষার চেকলিস্ট
        </h2>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={handleReset}
          disabled={resetting || loading}
        >
          {resetting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RotateCcw className="h-3.5 w-3.5" />
          )}
          রিসেট
        </Button>
      </div>

      <div className="mb-4 flex gap-1.5">
        <button
          onClick={() => setActiveCategory("NIGHT_BEFORE")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
            activeCategory === "NIGHT_BEFORE"
              ? "border-primary bg-primary/10 text-primary"
              : "hover:bg-muted"
          )}
        >
          <Moon className="h-3.5 w-3.5" />
          আগের রাত
        </button>
        <button
          onClick={() => setActiveCategory("EXAM_DAY")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
            activeCategory === "EXAM_DAY"
              ? "border-primary bg-primary/10 text-primary"
              : "hover:bg-muted"
          )}
        >
          <Sun className="h-3.5 w-3.5" />
          পরীক্ষার দিন
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {filteredItems.length > 0 && (
            <p className="mb-2 text-xs text-muted-foreground">
              {checkedCount}/{filteredItems.length} সম্পন্ন
            </p>
          )}
          <div className="space-y-1.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg border p-2.5 group"
              >
                <button
                  onClick={() => handleToggle(item.id, item.isChecked)}
                  disabled={togglingId === item.id}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
                    item.isChecked
                      ? "border-violet-500 bg-violet-500 text-white"
                      : "border-input hover:border-primary"
                  )}
                  aria-label={item.isChecked ? "আনচেক করো" : "চেক করো"}
                >
                  {togglingId === item.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : item.isChecked ? (
                    <Check className="h-3 w-3" />
                  ) : null}
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    item.isChecked && "text-muted-foreground line-through"
                  )}
                >
                  {item.label}
                </span>
                {item.isCustom && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-100 transition-[opacity,color,background-color] hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                    aria-label="আইটেম ডিলিট করো"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {showAddForm ? (
            <div className="mt-3 space-y-2">
              <Input
                placeholder="নতুন আইটেম লেখো..."
                aria-label="নতুন চেকলিস্ট আইটেম"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                maxLength={100}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddItem} disabled={adding} size="sm" className="gap-1.5">
                  {adding && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  যোগ করো
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                  বাতিল
                </Button>
              </div>
            </div>
          ) : (
            customCount < MAX_CUSTOM_ITEMS && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full gap-1.5"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                নিজের আইটেম যোগ করো
              </Button>
            )
          )}
        </>
      )}
    </Card>
  );
}
