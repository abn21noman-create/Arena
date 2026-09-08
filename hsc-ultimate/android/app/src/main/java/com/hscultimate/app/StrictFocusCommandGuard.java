package com.hscultimate.app;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.regex.Pattern;

/** Pure command validation/replay logic; intentionally has no Android dependency. */
final class StrictFocusCommandGuard {
    static final long MAX_COMMAND_AGE_MS = 120_000L;
    static final long MAX_FUTURE_SKEW_MS = 30_000L;
    static final int MAX_REMEMBERED_COMMANDS = 20;

    enum Decision {
        ACCEPT,
        INVALID,
        EXPIRED,
        FUTURE_COMMAND,
        REPLAY
    }

    private static final Pattern COMMAND_ID = Pattern.compile("[A-Za-z0-9_-]{16,64}");
    private static final Pattern SESSION_ID = Pattern.compile("[A-Za-z0-9_-]{10,80}");

    private StrictFocusCommandGuard() {}

    static Decision validateEnvelope(
        String commandId,
        long issuedAtEpochMs,
        long nowEpochMs,
        Set<String> processedCommandIds
    ) {
        if (commandId == null || !COMMAND_ID.matcher(commandId).matches() || issuedAtEpochMs <= 0L) {
            return Decision.INVALID;
        }
        if (issuedAtEpochMs > nowEpochMs + MAX_FUTURE_SKEW_MS) {
            return Decision.FUTURE_COMMAND;
        }
        if (nowEpochMs - issuedAtEpochMs > MAX_COMMAND_AGE_MS) {
            return Decision.EXPIRED;
        }
        if (processedCommandIds != null && processedCommandIds.contains(commandId)) {
            return Decision.REPLAY;
        }
        return Decision.ACCEPT;
    }

    static boolean isValidStart(
        String sessionId,
        long endsAtEpochMs,
        int durationMinutes,
        long nowEpochMs
    ) {
        if (!isValidSessionId(sessionId) || durationMinutes < 20 || durationMinutes > 120) {
            return false;
        }
        long maximumEnd = nowEpochMs + (120L * 60_000L) + MAX_FUTURE_SKEW_MS;
        return endsAtEpochMs > nowEpochMs && endsAtEpochMs <= maximumEnd;
    }

    static boolean isValidSessionId(String sessionId) {
        return sessionId != null && SESSION_ID.matcher(sessionId).matches();
    }

    static Set<String> parseRemembered(String serialized) {
        Set<String> values = new LinkedHashSet<>();
        if (serialized == null || serialized.isEmpty()) return values;
        for (String value : serialized.split(",")) {
            if (COMMAND_ID.matcher(value).matches()) values.add(value);
        }
        return values;
    }

    static String remember(String serialized, String commandId) {
        Set<String> values = parseRemembered(serialized);
        values.remove(commandId);
        values.add(commandId);
        while (values.size() > MAX_REMEMBERED_COMMANDS) {
            String oldest = values.iterator().next();
            values.remove(oldest);
        }
        return String.join(",", values);
    }
}
