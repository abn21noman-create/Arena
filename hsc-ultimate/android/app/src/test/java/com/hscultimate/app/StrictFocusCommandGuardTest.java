package com.hscultimate.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.Set;
import org.junit.Test;

public class StrictFocusCommandGuardTest {
    private static final long NOW = 1_700_000_000_000L;
    private static final String COMMAND = "12345678-1234-1234-1234-123456789012";
    private static final String SESSION = "clx1234567890session";

    @Test
    public void acceptsFreshUniqueEnvelope() {
        assertEquals(
            StrictFocusCommandGuard.Decision.ACCEPT,
            StrictFocusCommandGuard.validateEnvelope(COMMAND, NOW - 1_000L, NOW, Set.of())
        );
    }

    @Test
    public void rejectsExpiredAndFutureEnvelope() {
        assertEquals(
            StrictFocusCommandGuard.Decision.EXPIRED,
            StrictFocusCommandGuard.validateEnvelope(
                COMMAND,
                NOW - StrictFocusCommandGuard.MAX_COMMAND_AGE_MS - 1L,
                NOW,
                Set.of()
            )
        );
        assertEquals(
            StrictFocusCommandGuard.Decision.FUTURE_COMMAND,
            StrictFocusCommandGuard.validateEnvelope(
                COMMAND,
                NOW + StrictFocusCommandGuard.MAX_FUTURE_SKEW_MS + 1L,
                NOW,
                Set.of()
            )
        );
    }

    @Test
    public void rejectsMalformedAndReplayEnvelope() {
        assertEquals(
            StrictFocusCommandGuard.Decision.INVALID,
            StrictFocusCommandGuard.validateEnvelope("short", NOW, NOW, Set.of())
        );
        assertEquals(
            StrictFocusCommandGuard.Decision.REPLAY,
            StrictFocusCommandGuard.validateEnvelope(COMMAND, NOW, NOW, Set.of(COMMAND))
        );
    }

    @Test
    public void validatesFocusStartBounds() {
        assertTrue(
            StrictFocusCommandGuard.isValidStart(SESSION, NOW + 20 * 60_000L, 20, NOW)
        );
        assertTrue(
            StrictFocusCommandGuard.isValidStart(SESSION, NOW + 120 * 60_000L, 120, NOW)
        );
        assertFalse(
            StrictFocusCommandGuard.isValidStart(SESSION, NOW - 1L, 20, NOW)
        );
        assertFalse(
            StrictFocusCommandGuard.isValidStart(SESSION, NOW + 60_000L, 19, NOW)
        );
        assertFalse(
            StrictFocusCommandGuard.isValidStart("bad", NOW + 60_000L, 20, NOW)
        );
    }

    @Test
    public void remembersOnlyTheNewestBoundedCommandIds() {
        String serialized = "";
        for (int index = 0; index < 25; index += 1) {
            serialized = StrictFocusCommandGuard.remember(
                serialized,
                String.format("command-%02d-abcdefghijklmnop", index)
            );
        }
        Set<String> remembered = StrictFocusCommandGuard.parseRemembered(serialized);
        assertEquals(StrictFocusCommandGuard.MAX_REMEMBERED_COMMANDS, remembered.size());
        assertFalse(remembered.contains("command-00-abcdefghijklmnop"));
        assertTrue(remembered.contains("command-24-abcdefghijklmnop"));
    }
}
