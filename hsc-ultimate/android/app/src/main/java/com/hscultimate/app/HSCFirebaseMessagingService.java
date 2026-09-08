package com.hscultimate.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;
import java.util.Map;
import java.util.Set;

/** Receives normal notifications and consent-gated Strict Focus commands. */
public class HSCFirebaseMessagingService extends FirebaseMessagingService {
    private static final String CHANNEL_ID = "hsc_ultimate_default";
    private static final String START_TYPE = "STRICT_FOCUS_START";
    private static final String STOP_TYPE = "STRICT_FOCUS_STOP";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        PushNotificationsPlugin.sendRemoteMessage(remoteMessage);
        Map<String, String> data = remoteMessage.getData();
        if (START_TYPE.equals(data.get("type"))) {
            handleStrictFocusCommand(data);
            return;
        }
        if (STOP_TYPE.equals(data.get("type"))) {
            handleStrictFocusStop(data);
            return;
        }

        String title = "HSC Ultimate";
        String body = "নতুন নোটিফিকেশন এসেছে";
        if (remoteMessage.getNotification() != null) {
            if (remoteMessage.getNotification().getTitle() != null) {
                title = remoteMessage.getNotification().getTitle();
            }
            if (remoteMessage.getNotification().getBody() != null) {
                body = remoteMessage.getNotification().getBody();
            }
        } else {
            if (data.get("title") != null) title = data.get("title");
            if (data.get("body") != null) body = data.get("body");
        }
        sendNotification(title, body, false);
    }

    private String validateFreshCommand(
        Map<String, String> data,
        String type,
        String sessionId
    ) {
        if (!StrictFocusCommandGuard.isValidSessionId(sessionId)) return null;
        try {
            String commandId = data.get("commandId");
            long issuedAt = Long.parseLong(data.get("issuedAtEpochMs"));
            Set<String> processed = StrictFocusStore.processedCommandIds(this);
            StrictFocusCommandGuard.Decision decision =
                StrictFocusCommandGuard.validateEnvelope(
                    commandId,
                    issuedAt,
                    System.currentTimeMillis(),
                    processed
                );
            if (decision == StrictFocusCommandGuard.Decision.REPLAY) {
                // The original command already produced the authoritative receipt.
                return null;
            }
            if (decision != StrictFocusCommandGuard.Decision.ACCEPT) {
                if (
                    StrictFocusCommandGuard.isValidSessionId(sessionId) &&
                    commandId != null &&
                    commandId.length() >= 16
                ) {
                    String status = decision == StrictFocusCommandGuard.Decision.EXPIRED
                        ? "REJECTED_EXPIRED"
                        : decision == StrictFocusCommandGuard.Decision.FUTURE_COMMAND
                            ? "REJECTED_FUTURE_COMMAND"
                            : "REJECTED_MALFORMED";
                    StrictFocusStore.recordRemoteReceipt(
                        this, commandId, sessionId, type, status
                    );
                }
                return null;
            }
            StrictFocusStore.markCommandProcessed(this, commandId);
            return commandId;
        } catch (Exception ignored) {
            return null;
        }
    }

    private void handleStrictFocusCommand(Map<String, String> data) {
        String sessionId = data.get("sessionId");
        String commandId = validateFreshCommand(data, START_TYPE, sessionId);
        if (commandId == null) return;
        try {
            long endsAt = Long.parseLong(data.get("endsAtEpochMs"));
            int duration = Integer.parseInt(data.get("durationMinutes"));
            if (!StrictFocusCommandGuard.isValidStart(
                sessionId,
                endsAt,
                duration,
                System.currentTimeMillis()
            )) {
                StrictFocusStore.recordRemoteReceipt(
                    this, commandId, sessionId, START_TYPE, "REJECTED_MALFORMED"
                );
                return;
            }
            if (!StrictFocusStore.hasRemoteConsent(this)) {
                StrictFocusStore.recordRemoteReceipt(
                    this, commandId, sessionId, START_TYPE, "REJECTED_NO_CONSENT"
                );
                return;
            }
            if (!StrictFocusPlugin.isAccessibilityEnabled(this)) {
                StrictFocusStore.recordRemoteReceipt(
                    this,
                    commandId,
                    sessionId,
                    START_TYPE,
                    "REJECTED_ACCESSIBILITY_DISABLED"
                );
                return;
            }

            boolean started = StrictFocusService.startFromRemote(
                this,
                sessionId,
                endsAt,
                StrictFocusStore.defaultAllowlist(this)
            );
            if (!started) {
                StrictFocusStore.recordRemoteReceipt(
                    this, commandId, sessionId, START_TYPE, "REJECTED_MALFORMED"
                );
                return;
            }
            StrictFocusStore.recordRemoteReceipt(
                this, commandId, sessionId, START_TYPE, "STARTED"
            );

            sendNotification(
                "🔒 Strict Focus শুরু হয়েছে",
                duration + " মিনিটের Admin Focus Contract session চলছে",
                true
            );
            try {
                Intent open = new Intent(this, MainActivity.class)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(open);
            } catch (Exception ignored) {
                // Foreground service + accessibility enforcement remains active.
            }
        } catch (Exception ignored) {
            StrictFocusStore.recordRemoteReceipt(
                this, commandId, sessionId, START_TYPE, "REJECTED_MALFORMED"
            );
        }
    }

    private void handleStrictFocusStop(Map<String, String> data) {
        String requestedSession = data.get("sessionId");
        String commandId = validateFreshCommand(data, STOP_TYPE, requestedSession);
        if (commandId == null) return;
        if (!StrictFocusCommandGuard.isValidSessionId(requestedSession)) return;

        String currentSession = StrictFocusStore.prefs(this).getString(
            StrictFocusStore.KEY_SESSION_ID, ""
        );
        if (!requestedSession.equals(currentSession)) {
            StrictFocusStore.recordRemoteReceipt(
                this,
                commandId,
                requestedSession,
                STOP_TYPE,
                "REJECTED_SESSION_MISMATCH"
            );
            return;
        }
        StrictFocusStore.stop(this);
        stopService(new Intent(this, StrictFocusService.class));
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.cancel(4242);
            manager.cancel(4243);
        }
        StrictFocusStore.recordRemoteReceipt(
            this, commandId, requestedSession, STOP_TYPE, "STOPPED"
        );
        sendNotification("Strict Focus বন্ধ হয়েছে", "Session server থেকে বন্ধ করা হয়েছে", false);
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        PushNotificationsPlugin.onNewToken(token);
        // The authenticated Capacitor WebView registers this token with the API
        // on the next app open; never transmit a token without a user session.
        StrictFocusStore.prefs(this).edit().putString("pending_fcm_token", token).apply();
    }

    private void sendNotification(String title, String body, boolean focus) {
        Intent intent = new Intent(this, MainActivity.class)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            focus ? 4243 : 0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Uri sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(!focus)
            .setOngoing(focus)
            .setSound(sound)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH);

        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "HSC Ultimate Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Study reminders, focus commands, and updates");
            manager.createNotificationChannel(channel);
        }
        manager.notify(focus ? 4243 : 0, builder.build());
    }
}
