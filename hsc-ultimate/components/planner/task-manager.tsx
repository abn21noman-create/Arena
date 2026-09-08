"use client";

// ===================================================================
// Task Manager — টাস্ক তৈরি, স্ট্যাটাস পরিবর্তন, ডিলিট
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, CheckSquare, Square, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { showNewBadgeToasts } from "@/lib/badge-toast";

interface Task {
  id: string;
  title: string;
  dueDate: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "border-red-500 text-red-600 dark:text-red-400",
  MEDIUM: "border-amber-600 text-amber-600 dark:text-amber-400",
  LOW: "border-slate-400 text-slate-600 dark:text-slate-300 dark:border-slate-600",
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "জরুরি",
  MEDIUM: "মাঝারি",
  LOW: "কম",
};

export function TaskManager({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [adding, setAdding] = useState(false);
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — আগে শুধু বাটন disabled থাকত (কোনো visible
  // feedback ছাড়াই ইউজার বুঝত না কেন), এখন student-facing ফর্মের একই
  // aria-invalid+aria-describedby+visible error প্যাটার্ন প্রয়োগ করা হলো
  const [titleError, setTitleError] = useState<string | undefined>(undefined);

  async function handleAddTask() {
    if (!newTitle.trim()) {
      setTitleError("টাস্কের নাম আবশ্যক");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          dueDate: newDueDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "টাস্ক যোগ করা যায়নি");
        return;
      }
      setTasks((prev) => [data.task, ...prev]);
      setNewTitle("");
      setNewDueDate("");
      setTitleError(undefined);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setAdding(false);
    }
  }

  async function toggleStatus(task: Task) {
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      if (newStatus === "DONE") {
        const data = await res.json();
        toast.success("টাস্ক সম্পন্ন হয়েছে! +5 XP 🎉");
        showNewBadgeToasts(data.newBadges);
        router.refresh();
      }
    } catch {
      toast.error("আপডেট করা যায়নি");
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
    }
  }

  async function deleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("ডিলিট করা যায়নি");
      router.refresh();
    }
  }

  const pendingTasks = tasks.filter((t) => t.status !== "DONE");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  return (
    <Card className="p-5">
      <h2 className="font-semibold flex items-center gap-2 mb-4">
        <ListTodo className="h-4.5 w-4.5 text-primary" />
        টাস্ক লিস্ট
      </h2>

      {/* Add new task */}
      <div className="mb-5">
        <div className="flex gap-2">
          <Input
            id="new-task-title"
            placeholder="নতুন টাস্ক লেখো..."
            aria-label="নতুন টাস্কের নাম"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              if (titleError) setTitleError(undefined);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            aria-invalid={!!titleError}
            aria-describedby={titleError ? "new-task-title-error" : undefined}
          />
          <Input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="w-40"
            aria-label="টাস্কের শেষ তারিখ"
          />
          <Button onClick={handleAddTask} disabled={adding} aria-label="টাস্ক যোগ করো">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
        {titleError && (
          <p id="new-task-title-error" role="alert" className="text-xs text-destructive mt-1.5">
            {titleError}
          </p>
        )}
      </div>

      {/* Pending tasks */}
      <div className="space-y-2 mb-4">
        {pendingTasks.length === 0 && doneTasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            কোনো টাস্ক নেই। উপরে লিখে নতুন টাস্ক যোগ করো!
          </p>
        )}
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 rounded-lg border px-3 py-2.5 group"
          >
            <button
              onClick={() => toggleStatus(task)}
              className="shrink-0"
              aria-label="সম্পন্ন হিসেবে চিহ্নিত করো"
            >
              <Square className="h-4.5 w-4.5 text-muted-foreground hover:text-primary transition-colors" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">{task.title}</p>
              {task.dueDate && (
                <p className="text-xs text-muted-foreground">
                  {new Date(task.dueDate).toLocaleDateString("bn-BD", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className={cn("text-xs shrink-0", PRIORITY_STYLES[task.priority])}
            >
              {PRIORITY_LABELS[task.priority]}
            </Badge>
            <button
              onClick={() => deleteTask(task.id)}
              className="shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              aria-label="মুছে ফেলো"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Done tasks */}
      {doneTasks.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">সম্পন্ন ({doneTasks.length})</p>
          <div className="space-y-1.5">
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2 group opacity-60"
              >
                <button
                  onClick={() => toggleStatus(task)}
                  className="shrink-0"
                  aria-label="আবার পেন্ডিং করো"
                >
                  <CheckSquare className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
                </button>
                <p className="text-sm truncate flex-1 line-through">{task.title}</p>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  aria-label="মুছে ফেলো"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
