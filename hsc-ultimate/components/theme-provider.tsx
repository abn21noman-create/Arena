"use client";

// ===================================================================
// Theme Provider — next-themes wrapper (Dark/Light mode)
// -------------------------------------------------------------------
// System preference detect করে, localStorage এ save করে, ও FOUC
// (Flash of Unstyled Content) এড়াতে attribute="class" ব্যবহার করে।
// ===================================================================
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
