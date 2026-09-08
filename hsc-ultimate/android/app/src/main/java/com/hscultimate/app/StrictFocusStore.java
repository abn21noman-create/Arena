package com.hscultimate.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.provider.Settings;
import android.os.SystemClock;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import org.json.JSONArray;
import org.json.JSONObject;

final class StrictFocusStore {
    static final String PREFS = "hsc_strict_focus";
    static final String KEY_ACTIVE = "active";
    static final String KEY_SESSION_ID = "session_id";
    static final String KEY_ENDS_AT = "ends_at";
    static final String KEY_ENDS_AT_ELAPSED = "ends_at_elapsed";
    static final String KEY_REMOTE_CONSENT = "remote_consent";
    static final String KEY_ALLOWED_PACKAGES = "allowed_packages";
    static final String KEY_PROCESSED_COMMAND_IDS = "processed_command_ids";
    static final String KEY_PENDING_REMOTE_RECEIPTS = "pending_remote_receipts";

    private StrictFocusStore() {}

    static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static Set<String> defaultAllowlist(Context context) {
        Set<String> values = new HashSet<>(Arrays.asList(
            context.getPackageName(),
            "com.android.dialer",
            "com.google.android.dialer",
            "com.android.server.telecom",
            "com.android.emergency",
            "com.google.android.deskclock",
            "com.android.deskclock",
            "com.sec.android.app.clockpackage",
            "com.android.systemui",
            "com.google.android.inputmethod.latin",
            "com.samsung.android.honeyboard"
        ));
        String inputMethod = Settings.Secure.getString(
            context.getContentResolver(), Settings.Secure.DEFAULT_INPUT_METHOD
        );
        if (inputMethod != null && inputMethod.contains("/")) {
            values.add(inputMethod.substring(0, inputMethod.indexOf('/')));
        }
        return values;
    }

    static void start(Context context, String sessionId, long endsAtEpochMs, Set<String> allowedPackages) {
        Set<String> safeAllowlist = new HashSet<>(defaultAllowlist(context));
        if (allowedPackages != null) safeAllowlist.addAll(allowedPackages);
        long remainingMs = Math.max(0L, endsAtEpochMs - System.currentTimeMillis());
        prefs(context).edit()
            .putBoolean(KEY_ACTIVE, true)
            .putString(KEY_SESSION_ID, sessionId)
            .putLong(KEY_ENDS_AT, endsAtEpochMs)
            .putLong(KEY_ENDS_AT_ELAPSED, SystemClock.elapsedRealtime() + remainingMs)
            .putStringSet(KEY_ALLOWED_PACKAGES, safeAllowlist)
            .apply();
    }

    static void stop(Context context) {
        prefs(context).edit()
            .putBoolean(KEY_ACTIVE, false)
            .remove(KEY_SESSION_ID)
            .remove(KEY_ENDS_AT)
            .remove(KEY_ENDS_AT_ELAPSED)
            .remove(KEY_ALLOWED_PACKAGES)
            .apply();
    }

    static long remainingMs(Context context) {
        SharedPreferences prefs = prefs(context);
        long wallRemaining = prefs.getLong(KEY_ENDS_AT, 0L) - System.currentTimeMillis();
        long elapsedRemaining = prefs.getLong(KEY_ENDS_AT_ELAPSED, 0L) - SystemClock.elapsedRealtime();
        return Math.max(0L, Math.min(wallRemaining, elapsedRemaining));
    }

    static boolean isActive(Context context) {
        SharedPreferences prefs = prefs(context);
        boolean active = prefs.getBoolean(KEY_ACTIVE, false);
        if (active && remainingMs(context) > 0L) return true;
        if (active) stop(context);
        return false;
    }

    static void rebaseElapsedDeadlineAfterBoot(Context context) {
        SharedPreferences prefs = prefs(context);
        if (!prefs.getBoolean(KEY_ACTIVE, false)) return;
        long wallRemaining = Math.max(
            0L,
            prefs.getLong(KEY_ENDS_AT, 0L) - System.currentTimeMillis()
        );
        prefs.edit()
            .putLong(KEY_ENDS_AT_ELAPSED, SystemClock.elapsedRealtime() + wallRemaining)
            .apply();
    }

    static boolean isAllowed(Context context, String packageName) {
        if (packageName == null) return true;
        Set<String> allowed = prefs(context).getStringSet(
            KEY_ALLOWED_PACKAGES, defaultAllowlist(context)
        );
        return allowed != null && allowed.contains(packageName);
    }

    static synchronized Set<String> processedCommandIds(Context context) {
        return StrictFocusCommandGuard.parseRemembered(
            prefs(context).getString(KEY_PROCESSED_COMMAND_IDS, "")
        );
    }

    static synchronized void markCommandProcessed(Context context, String commandId) {
        String current = prefs(context).getString(KEY_PROCESSED_COMMAND_IDS, "");
        prefs(context).edit()
            .putString(
                KEY_PROCESSED_COMMAND_IDS,
                StrictFocusCommandGuard.remember(current, commandId)
            )
            .apply();
    }

    static synchronized void recordRemoteReceipt(
        Context context,
        String commandId,
        String sessionId,
        String type,
        String status
    ) {
        try {
            String raw = prefs(context).getString(KEY_PENDING_REMOTE_RECEIPTS, "[]");
            JSONArray current = new JSONArray(raw == null ? "[]" : raw);
            JSONArray next = new JSONArray();
            int start = Math.max(0, current.length() - 9);
            for (int index = start; index < current.length(); index += 1) {
                next.put(current.get(index));
            }
            JSONObject receipt = new JSONObject();
            receipt.put("commandId", commandId);
            receipt.put("sessionId", sessionId);
            receipt.put("type", type);
            receipt.put("status", status);
            receipt.put("occurredAtEpochMs", System.currentTimeMillis());
            next.put(receipt);
            prefs(context).edit()
                .putString(KEY_PENDING_REMOTE_RECEIPTS, next.toString())
                .apply();
        } catch (Exception ignored) {
            // A receipt must never affect emergency access or focus enforcement.
        }
    }

    static synchronized String pendingRemoteReceiptsJson(Context context) {
        return prefs(context).getString(KEY_PENDING_REMOTE_RECEIPTS, "[]");
    }

    static synchronized void clearPendingRemoteReceipts(Context context) {
        prefs(context).edit().remove(KEY_PENDING_REMOTE_RECEIPTS).apply();
    }

    static boolean hasRemoteConsent(Context context) {
        return prefs(context).getBoolean(KEY_REMOTE_CONSENT, false);
    }
}
