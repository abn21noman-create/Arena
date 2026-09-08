package com.hscultimate.app;

import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import android.provider.AlarmClock;
import android.text.TextUtils;
import android.view.accessibility.AccessibilityManager;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CapacitorPlugin(name = "StrictFocus")
public class StrictFocusPlugin extends Plugin {

    @PluginMethod
    public void start(PluginCall call) {
        String sessionId = call.getString("sessionId");
        Long endsAtEpochMs = call.getLong("endsAtEpochMs");
        if (TextUtils.isEmpty(sessionId) || endsAtEpochMs == null || endsAtEpochMs <= System.currentTimeMillis()) {
            call.reject("Valid sessionId and future endsAtEpochMs are required");
            return;
        }

        Set<String> allowlist = new HashSet<>();
        JSArray packages = call.getArray("allowedPackages");
        if (packages != null) {
            try {
                List<Object> values = packages.toList();
                for (Object value : values) {
                    if (value instanceof String) allowlist.add((String) value);
                }
            } catch (Exception error) {
                call.reject("allowedPackages must be a string array", error);
                return;
            }
        }

        StrictFocusStore.start(getContext(), sessionId, endsAtEpochMs, allowlist);
        Intent service = new Intent(getContext(), StrictFocusService.class);
        ContextCompat.startForegroundService(getContext(), service);
        JSObject result = new JSObject();
        result.put("active", true);
        call.resolve(result);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        String requestedSession = call.getString("sessionId", "");
        String currentSession = StrictFocusStore.prefs(getContext()).getString(
            StrictFocusStore.KEY_SESSION_ID, ""
        );
        if (!TextUtils.isEmpty(currentSession) && !TextUtils.equals(currentSession, requestedSession)) {
            call.reject("Session ID does not match the active focus session");
            return;
        }
        StrictFocusStore.stop(getContext());
        getContext().stopService(new Intent(getContext(), StrictFocusService.class));
        JSObject result = new JSObject();
        result.put("active", false);
        call.resolve(result);
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        boolean active = StrictFocusStore.isActive(getContext());
        JSObject result = new JSObject();
        result.put("active", active);
        result.put("accessibilityEnabled", isAccessibilityEnabled(getContext()));
        result.put("remoteConsentEnabled", StrictFocusStore.hasRemoteConsent(getContext()));
        if (active) {
            result.put("sessionId", StrictFocusStore.prefs(getContext()).getString(
                StrictFocusStore.KEY_SESSION_ID, ""
            ));
            result.put("endsAtEpochMs", StrictFocusStore.prefs(getContext()).getLong(
                StrictFocusStore.KEY_ENDS_AT, 0L
            ));
        }
        call.resolve(result);
    }

    @PluginMethod
    public void setRemoteConsent(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        StrictFocusStore.prefs(getContext()).edit()
            .putBoolean(StrictFocusStore.KEY_REMOTE_CONSENT, enabled)
            .apply();
        JSObject result = new JSObject();
        result.put("enabled", enabled);
        call.resolve(result);
    }

    @PluginMethod
    public void getPendingRemoteReceipts(PluginCall call) {
        try {
            JSArray receipts = new JSArray(
                StrictFocusStore.pendingRemoteReceiptsJson(getContext())
            );
            JSObject result = new JSObject();
            result.put("receipts", receipts);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Pending native receipts are malformed", error);
        }
    }

    @PluginMethod
    public void clearPendingRemoteReceipts(PluginCall call) {
        StrictFocusStore.clearPendingRemoteReceipts(getContext());
        JSObject result = new JSObject();
        result.put("cleared", true);
        call.resolve(result);
    }

    @PluginMethod
    public void openAccessibilitySettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void openAllowedApp(PluginCall call) {
        String kind = call.getString("kind", "PHONE");
        Intent intent;
        if ("CLOCK".equals(kind)) {
            intent = new Intent(AlarmClock.ACTION_SHOW_ALARMS);
        } else {
            intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:"));
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            call.reject("Allowed app is not available", error);
        }
    }

    static boolean isAccessibilityEnabled(Context context) {
        AccessibilityManager manager = (AccessibilityManager) context.getSystemService(Context.ACCESSIBILITY_SERVICE);
        if (manager == null) return false;
        List<AccessibilityServiceInfo> services = manager.getEnabledAccessibilityServiceList(
            AccessibilityServiceInfo.FEEDBACK_ALL_MASK
        );
        ComponentName expected = new ComponentName(context, StrictFocusAccessibilityService.class);
        for (AccessibilityServiceInfo service : services) {
            if (service.getResolveInfo() == null || service.getResolveInfo().serviceInfo == null) continue;
            ComponentName actual = new ComponentName(
                service.getResolveInfo().serviceInfo.packageName,
                service.getResolveInfo().serviceInfo.name
            );
            if (expected.equals(actual)) return true;
        }
        return false;
    }
}
