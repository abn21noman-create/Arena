/**
 * HSC Ultimate — Android-specific Capacitor Configuration
 *
 * Used when building Android APK / AAB for Play Store or direct install.
 * This file is auto-loaded by Capacitor CLI for the Android platform.
 */
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hscultimate.app',
  appName: 'HSC Ultimate',
  webDir: 'out',
  server: {
    // Override with env var for dev: CAPACITOR_SERVER_URL=http://10.0.2.2:3000
    url: process.env.CAPACITOR_SERVER_URL || 'https://hsc-ultimate.app',
    cleartext: process.env.NODE_ENV === 'development',
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development',
    backgroundColor: '#0a0a0f',
    // Native permissions are declared in AndroidManifest.xml.
  },
};

export default config;
