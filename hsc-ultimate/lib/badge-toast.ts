// ===================================================================
// নতুন Badge পাওয়ার toast notification দেখানোর জন্য shared helper
// ===================================================================
import { toast } from "sonner";

interface NewBadge {
  code: string;
  name: string;
  iconEmoji: string;
}

export function showNewBadgeToasts(newBadges?: NewBadge[]) {
  if (!newBadges || newBadges.length === 0) return;
  for (const badge of newBadges) {
    toast.success(`${badge.iconEmoji} নতুন ব্যাজ অর্জিত: ${badge.name}!`, {
      duration: 5000,
    });
  }
}
