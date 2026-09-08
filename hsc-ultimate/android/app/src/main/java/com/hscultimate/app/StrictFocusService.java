package com.hscultimate.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import java.util.Set;

public class StrictFocusService extends Service {
    private static final String CHANNEL_ID = "hsc_strict_focus";
    private static final int NOTIFICATION_ID = 4242;
    private final Handler handler = new Handler(Looper.getMainLooper());

    private final Runnable expiryCheck = new Runnable() {
        @Override
        public void run() {
            if (!StrictFocusStore.isActive(StrictFocusService.this)) {
                stopSelf();
                return;
            }
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) manager.notify(NOTIFICATION_ID, buildNotification());
            handler.postDelayed(this, 15_000L);
        }
    };

    public static boolean startFromRemote(
        Context context,
        String sessionId,
        long endsAtEpochMs,
        Set<String> allowlist
    ) {
        if (!StrictFocusStore.hasRemoteConsent(context)) return false;
        if (!StrictFocusPlugin.isAccessibilityEnabled(context)) return false;
        if (endsAtEpochMs <= System.currentTimeMillis()) return false;
        StrictFocusStore.start(context, sessionId, endsAtEpochMs, allowlist);
        ContextCompat.startForegroundService(context, new Intent(context, StrictFocusService.class));
        return true;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (!StrictFocusStore.isActive(this)) {
            stopSelf();
            return START_NOT_STICKY;
        }
        startForeground(NOTIFICATION_ID, buildNotification());
        handler.removeCallbacks(expiryCheck);
        handler.post(expiryCheck);
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(expiryCheck);
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Strict Focus",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Active Deep Study timer and app blocking status");
        channel.setShowBadge(false);
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) manager.createNotificationChannel(channel);
    }

    private Notification buildNotification() {
        long remainingMinutes = (StrictFocusStore.remainingMs(this) + 59_999L) / 60_000L;
        Intent open = new Intent(this, MainActivity.class)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pending = PendingIntent.getActivity(
            this,
            4242,
            open,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Strict Focus চলছে")
            .setContentText(remainingMinutes + " মিনিট বাকি · Phone ও Alarm চালু থাকবে")
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setContentIntent(pending)
            .build();
    }
}
