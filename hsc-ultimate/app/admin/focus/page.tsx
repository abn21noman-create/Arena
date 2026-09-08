import { FocusControlPanel } from "@/components/admin/focus-control-panel";
import { FocusScheduler } from "@/components/admin/focus-scheduler";
import { FocusSchedulerHealth } from "@/components/admin/focus-scheduler-health";
import { NativeDeliveryDiagnostics } from "@/components/admin/native-delivery-diagnostics";

export default function AdminFocusPage() {
  return (
    <div className="space-y-6">
      <FocusControlPanel />
      <FocusSchedulerHealth />
      <NativeDeliveryDiagnostics />
      <FocusScheduler />
    </div>
  );
}
