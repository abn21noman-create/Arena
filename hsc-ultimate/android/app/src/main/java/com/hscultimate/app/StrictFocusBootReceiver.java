package com.hscultimate.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.core.content.ContextCompat;

/** Restores an unexpired local focus timer after a normal device reboot. */
public class StrictFocusBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
        StrictFocusStore.rebaseElapsedDeadlineAfterBoot(context);
        if (StrictFocusStore.isActive(context)) {
            ContextCompat.startForegroundService(
                context,
                new Intent(context, StrictFocusService.class)
            );
        }
    }
}
