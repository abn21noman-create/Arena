"use client";

// NextAuth এর ক্লায়েন্ট-সাইড session context (useSession hook ব্যবহার করার জন্য দরকার)
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { AccessibilityProvider } from "@/components/accessibility-provider";
import { AccentThemeProvider } from "@/components/accent-theme-provider";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import { DialogInertBackground } from "@/components/dialog-inert-background";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        themes={["light", "dark", "system"]}
        storageKey="theme"
        disableTransitionOnChange={false}
      >
        <AccentThemeProvider>
          <AccessibilityProvider>
            <ConfirmDialogProvider>
              {/* delayDuration=300 (ডিফল্ট shadcn ভ্যালু) — খুব দ্রুত hover
                  করলে অপ্রয়োজনীয় tooltip flash না দেখায় */}
              <TooltipProvider delay={300}>
                <DialogInertBackground />
                {children}
              </TooltipProvider>
            </ConfirmDialogProvider>
          </AccessibilityProvider>
        </AccentThemeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

