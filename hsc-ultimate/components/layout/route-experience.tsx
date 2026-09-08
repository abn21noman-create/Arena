"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getRouteDocumentTitle, getRouteLabel } from "@/lib/route-labels";

/**
 * Keeps browser-tab context and assistive-technology feedback accurate during
 * App Router client navigation. It contains no telemetry and stores no user
 * activity; it only reflects the route that is already visible.
 */
export function RouteExperience() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const label = getRouteLabel(pathname);
    const title = getRouteDocumentTitle(pathname);

    // Next's initial head reconciliation can finish just after child effects.
    // Apply immediately and once more after hydration so the generic root title
    // cannot overwrite the contextual route title on a hard refresh.
    const applyTitle = () => {
      if (document.title !== title) document.title = title;
    };
    applyTitle();
    setAnnouncement("");
    const timer = window.setTimeout(() => {
      applyTitle();
      setAnnouncement(`${label} পেজ লোড হয়েছে`);
    }, 180);

    // Dashboard data sync can trigger router.refresh() without changing the
    // pathname. Next then reconciles the generic root metadata again, so the
    // pathname effect itself would not rerun. Observe only the head and restore
    // the contextual title when that refresh replaces it.
    const observer = new MutationObserver(applyTitle);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </p>
  );
}
