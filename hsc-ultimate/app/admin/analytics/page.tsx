// ===================================================================
// Admin Analytics পেজ (Server Component wrapper)
// -------------------------------------------------------------------
// ⚡ Performance: recharts lazy load (admin-only পেজ, বেশি heavy)
// ===================================================================
import { LazyAdminAnalytics } from "@/components/shared/dynamic-imports";

export default function AdminAnalyticsPage() {
  return <LazyAdminAnalytics />;
}
