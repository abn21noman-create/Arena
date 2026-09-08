import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Configuration for HSC Ultimate
 *
 * Builds native Android APK + Windows .msi from the existing Next.js web app.
 * The web app is served from `webDir` (static Next.js export) OR from a live
 * server URL (set via `server.url`).
 *
 * Modes:
 *   - DEV:   server.url = "http://10.0.2.2:3000" (Android emulator → host) or "http://localhost:3000" (Windows)
 *   - PROD:  server.url = "https://hsc-ultimate.app" (deploy first, then point app to it)
 *   - STATIC: webDir = "out" (after `next build` with `output: 'export'`)
 *
 * Default: PROD mode (live URL) — recommended for full app with auth, DB, API routes.
 */
const capacitorConfig: CapacitorConfig = {
  appId: 'com.hscultimate.app',
  appName: 'HSC Ultimate',
  webDir: 'out', // Minimal local shell; production content loads from server.url
  // Server URL mode: when set, Capacitor loads the web app from this URL.
  // This is the recommended mode for Next.js apps with API routes / DB / auth.
  // Override per-build via CAPACITOR_SERVER_URL env var.
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://hsc-ultimate.app',
    cleartext: false, // HTTPS only (use cleartext: true + url http for dev)
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // true for dev only
    backgroundColor: '#0a0a0f',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0a0a0f',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      spinnerColor: '#3b82f6',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0f',
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default capacitorConfig;
