"use client";

// ===================================================================
// Saved Topics পেজ — Bookmark Collections/Folders সহ (ক্লায়েন্ট কম্পোনেন্ট)
// -------------------------------------------------------------------
// established Habit Tracker এর একই CRUD প্যাটার্ন অনুসরণ করা হয়েছে —
// ফোল্ডার তৈরি/rename/delete, প্রতিটা bookmark কে dropdown দিয়ে
// ফোল্ডারে move করা যায়। "সব" ট্যাব সবসময় থাকে (কোনো ফিল্টার ছাড়া),
// "কোনো ফোল্ডারে নেই" ট্যাব folderId=null bookmark গুলো দেখায়।
// ===================================================================
import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Bookmark,
  BookOpen,
  FolderPlus,
  Folder,
  FolderX,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkFolderData {
  id: string;
  name: string;
  colorHex: string;
  _count: { bookmarks: number };
}

interface BookmarkItem {
  id: string;
  topicId: string;
  folderId: string | null;
  topic: {
    name: string;
    isImportant: boolean;
    chapter: { name: string; subjectId: string; subject: { name: string } };
  };
}

const MAX_BOOKMARK_FOLDERS = 15;
const MAX_FOLDER_NAME_LENGTH = 50;

export function SavedTopicsPageClient({
  initialBookmarks,
  initialFolders,
}: {
  initialBookmarks: BookmarkItem[];
  initialFolders: BookmarkFolderData[];
}) {
  const confirmAction = useConfirmDialog();
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [folders, setFolders] = useState(initialFolders);
  const [activeFolderId, setActiveFolderId] = useState<string | null | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  async function handleCreateFolder() {
    if (!newFolderName.trim()) {
      toast.error("ফোল্ডারের নাম দাও");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/bookmark-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "ফোল্ডার তৈরি করা যায়নি");
        return;
      }
      setFolders((prev) => [...prev, { ...data.folder, _count: { bookmarks: 0 } }]);
      setNewFolderName("");
      setShowAddForm(false);
      toast.success("নতুন ফোল্ডার তৈরি হয়েছে!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setCreating(false);
    }
  }

  async function handleRenameFolder(folderId: string) {
    if (!renameValue.trim()) {
      toast.error("ফোল্ডারের নাম দাও");
      return;
    }
    try {
      const res = await fetch(`/api/bookmark-folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "নাম পরিবর্তন করা যায়নি");
        return;
      }
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, name: renameValue.trim() } : f))
      );
      setRenamingId(null);
      toast.success("ফোল্ডারের নাম পরিবর্তন হয়েছে");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    }
  }

  async function handleDeleteFolder(folderId: string, folderName: string) {
    if (
      !(await confirmAction({
        description: `"${folderName}" ফোল্ডার ডিলিট করলে ভেতরের সেভ করা টপিক গুলো মুছে যাবে না, শুধু "সব"-এ ফিরে যাবে। নিশ্চিত?`,
        confirmLabel: "ডিলিট করো",
      }))
    )
      return;
    try {
      const res = await fetch(`/api/bookmark-folders/${folderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      setBookmarks((prev) =>
        prev.map((b) => (b.folderId === folderId ? { ...b, folderId: null } : b))
      );
      if (activeFolderId === folderId) setActiveFolderId("all");
      toast.success("ফোল্ডার ডিলিট হয়েছে");
    } catch {
      toast.error("ডিলিট করা যায়নি");
    }
  }

  async function handleMoveBookmark(topicId: string, folderId: string | null) {
    try {
      const res = await fetch(`/api/bookmarks/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "সরানো যায়নি");
        return;
      }
      setBookmarks((prev) => prev.map((b) => (b.topicId === topicId ? { ...b, folderId } : b)));
      toast.success(folderId ? "ফোল্ডারে সরানো হয়েছে" : "ফোল্ডার থেকে বের করা হয়েছে");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    }
  }

  const filteredBookmarks =
    activeFolderId === "all"
      ? bookmarks
      : activeFolderId === null
        ? bookmarks.filter((b) => b.folderId === null)
        : bookmarks.filter((b) => b.folderId === activeFolderId);

  return (
    <div>
      {/* ফোল্ডার ট্যাব + তৈরি বাটন */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveFolderId("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            activeFolderId === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          সব ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveFolderId(null)}
          className={cn(
            "flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            activeFolderId === null
              ? "border-primary bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          <FolderX className="h-3 w-3" />
          কোনো ফোল্ডারে নেই ({bookmarks.filter((b) => b.folderId === null).length})
        </button>
        {folders.map((folder) => (
          <div key={folder.id} className="group relative">
            <button
              onClick={() => setActiveFolderId(folder.id)}
              className={cn(
                "flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeFolderId === folder.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Folder className="h-3 w-3" style={{ color: folder.colorHex }} />
              {folder.name} ({folder._count.bookmarks})
            </button>
          </div>
        ))}
        {folders.length < MAX_BOOKMARK_FOLDERS && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 rounded-full text-xs"
            onClick={() => setShowAddForm((v) => !v)}
          >
            <FolderPlus className="h-3.5 w-3.5" />
            নতুন ফোল্ডার
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card className="mb-4 space-y-2.5 p-3">
          <Input
            placeholder="যেমন: পরীক্ষার আগে রিভিশন"
            aria-label="নতুন ফোল্ডারের নাম"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            maxLength={MAX_FOLDER_NAME_LENGTH}
          />
          <div className="flex gap-2">
            <Button onClick={handleCreateFolder} disabled={creating} size="sm" className="gap-1.5">
              {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              তৈরি করো
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
              বাতিল
            </Button>
          </div>
        </Card>
      )}

      {/* সক্রিয় ফোল্ডারের rename/delete কন্ট্রোল */}
      {typeof activeFolderId === "string" && (
        <div className="mb-4 flex items-center gap-2">
          {renamingId === activeFolderId ? (
            <>
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                maxLength={MAX_FOLDER_NAME_LENGTH}
                className="h-8 max-w-xs"
                autoFocus
              />
              <Button size="sm" onClick={() => handleRenameFolder(activeFolderId)}>
                সেভ
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRenamingId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-xs text-muted-foreground"
                onClick={() => {
                  const folder = folders.find((f) => f.id === activeFolderId);
                  setRenameValue(folder?.name ?? "");
                  setRenamingId(activeFolderId);
                }}
              >
                <Pencil className="h-3 w-3" />
                নাম পরিবর্তন
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-xs text-destructive"
                onClick={() => {
                  const folder = folders.find((f) => f.id === activeFolderId);
                  if (folder) handleDeleteFolder(folder.id, folder.name);
                }}
              >
                <Trash2 className="h-3 w-3" />
                ফোল্ডার ডিলিট
              </Button>
            </>
          )}
        </div>
      )}

      {filteredBookmarks.length === 0 ? (
        <Card className="p-10 text-center">
          <Bookmark className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="mb-1 font-medium">
            {activeFolderId === "all" ? "এখনো কোনো টপিক সেভ করা হয়নি" : "এই ফোল্ডারে কোনো টপিক নেই"}
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            Learning Hub এ কোনো টপিক খুলে &quot;সেভ করো&quot; বাটনে চাপ দাও
          </p>
          <Link href="/learn" className="text-sm font-medium text-primary hover:underline">
            Learning Hub এ যাও →
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBookmarks.map((b) => (
            <Card key={b.id} className="flex items-center justify-between p-4 hover-lift">
              <Link
                href={`/learn/${b.topic.chapter.subjectId}/${b.topicId}`}
                className="min-w-0 flex-1"
              >
                <p className="mb-0.5 truncate text-xs text-muted-foreground">
                  {b.topic.chapter.subject.name} • {b.topic.chapter.name}
                </p>
                <p className="flex items-center gap-1.5 truncate font-medium">
                  <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                  {b.topic.name}
                </p>
              </Link>
              <div className="ml-2 flex shrink-0 items-center gap-1.5">
                {b.topic.isImportant && <Badge variant="secondary">গুরুত্বপূর্ণ</Badge>}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" aria-label="ফোল্ডারে সরাও" className="h-8 w-8" />
                    }
                  >
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleMoveBookmark(b.topicId, null)}>
                      <FolderX className="h-4 w-4" />
                      কোনো ফোল্ডারে না রাখা
                    </DropdownMenuItem>
                    {folders.map((folder) => (
                      <DropdownMenuItem
                        key={folder.id}
                        onClick={() => handleMoveBookmark(b.topicId, folder.id)}
                      >
                        <Folder className="h-4 w-4" style={{ color: folder.colorHex }} />
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
