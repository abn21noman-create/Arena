package com.hscultimate.app;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.view.accessibility.AccessibilityEvent;
import androidx.core.content.ContextCompat;

/**
 * Strict Focus only inspects the foreground package name. It never retrieves,
 * stores, or uploads screen text/content.
 */
public class StrictFocusAccessibilityService extends AccessibilityService {
    private long lastRedirectAt = 0L;
    private String lastBlockedPackage = "";

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        if (StrictFocusStore.isActive(this)) {
            ContextCompat.startForegroundService(this, new Intent(this, StrictFocusService.class));
        }
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || !StrictFocusStore.isActive(this)) return;
        CharSequence packageSequence = event.getPackageName();
        if (packageSequence == null) return;
        String packageName = packageSequence.toString();
        if (StrictFocusStore.isAllowed(this, packageName)) return;

        long now = System.currentTimeMillis();
        if (packageName.equals(lastBlockedPackage) && now - lastRedirectAt < 750L) return;
        lastBlockedPackage = packageName;
        lastRedirectAt = now;

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK |
            Intent.FLAG_ACTIVITY_CLEAR_TOP |
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        );
        intent.putExtra("strict_focus_blocked_package", packageName);
        startActivity(intent);
    }

    @Override
    public void onInterrupt() {
        // No continuous audio/haptic feedback to interrupt.
    }
}
