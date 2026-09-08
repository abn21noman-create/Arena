package com.hscultimate.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/**
 * HSC Ultimate — Main Activity
 * Capacitor 8.x WebView wrapper that hosts the Next.js web app.
 *
 * Web app loads from:
 *   - Production: https://hsc-ultimate.app (set in capacitor.config.ts)
 *   - Dev:        http://10.0.2.2:3000 (Android emulator → host machine)
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StrictFocusPlugin.class);
        super.onCreate(savedInstanceState);

        // Bridge initialization happens in super
        // The web app is loaded automatically based on capacitor.config.ts
    }
}
