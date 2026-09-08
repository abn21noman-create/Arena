// ===================================================================
// Admin: System Control পেজ (Server Component wrapper)
// ===================================================================
import { SystemControlPanel } from "@/components/admin/system-control-panel";
import { SystemOperationsDashboard } from "@/components/admin/system-operations-dashboard";

export default function AdminSystemPage() {
  return (
    <div className="space-y-6">
      <SystemOperationsDashboard />
      <SystemControlPanel />
    </div>
  );
}
