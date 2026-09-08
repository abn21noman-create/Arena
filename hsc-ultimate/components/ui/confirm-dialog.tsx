"use client";

// ===================================================================
// Confirm Dialog — browser-native window.confirm() এর বিকল্প
// -------------------------------------------------------------------
// এতদিন প্ল্যাটফর্মের ১০টা+ জায়গায় (admin panel delete, forum post
// delete, habit delete, battle end ইত্যাদি) raw browser `confirm()`
// ব্যবহার হচ্ছিল — যা ব্র্যান্ডিং/থিমের সাথে সামঞ্জস্যপূর্ণ না (কুৎসিত
// unstyled browser popup), ডার্ক মোডে বেমানান, এবং keyboard focus
// trap browser-dependent। এই কম্পোনেন্ট একই imperative API
// (`await confirmAction("বার্তা")` → boolean) দিয়ে base-ui এর
// AlertDialog primitive ব্যবহার করে সুন্দর, থিম-সামঞ্জস্যপূর্ণ, সঠিক
// focus-trap+keyboard (Esc বন্ধ, Tab আটকানো) সহ confirm ডায়ালগ দেখায়।
//
// ব্যবহার: root এ <ConfirmDialogProvider> বসিয়ে যেকোনো client
// কম্পোনেন্টে `const confirm = useConfirmDialog()` করে
// `if (!(await confirm("...."))) return;` — ঠিক আগের
// `if (!window.confirm("...")) return;` এর মতোই ব্যবহার, তাই migration
// ন্যূনতম changes এ সম্ভব হয়েছে।
// ===================================================================
import * as React from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (
  description: string | ConfirmOptions
) => Promise<boolean>;

const ConfirmDialogContext = React.createContext<ConfirmFn | null>(null);

export function useConfirmDialog(): ConfirmFn {
  const ctx = React.useContext(ConfirmDialogContext);
  if (!ctx) {
    throw new Error("useConfirmDialog অবশ্যই ConfirmDialogProvider এর ভেতরে ব্যবহার করতে হবে");
  }
  return ctx;
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmOptions>({ description: "" });
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirmAction = React.useCallback<ConfirmFn>((input) => {
    const opts: ConfirmOptions = typeof input === "string" ? { description: input } : input;
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function handleResult(result: boolean) {
    setOpen(false);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }

  return (
    <ConfirmDialogContext.Provider value={confirmAction}>
      {children}
      <AlertDialog.Root
        open={open}
        onOpenChange={(v) => {
          // Esc/backdrop দিয়ে বন্ধ করলে "বাতিল" হিসেবে গণ্য হবে
          if (!v) handleResult(false);
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 isolate z-50 bg-black/20 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <AlertDialog.Popup
            className={cn(
              "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-5 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "shrink-0 rounded-full p-2",
                  options.destructive !== false ? "bg-destructive/10" : "bg-primary/10"
                )}
              >
                <AlertTriangle
                  className={cn(
                    "h-5 w-5",
                    options.destructive !== false ? "text-destructive" : "text-primary"
                  )}
                />
              </div>
              <div className="flex-1 pt-1">
                <AlertDialog.Title className="font-heading text-base font-semibold">
                  {options.title ?? "নিশ্চিত করো"}
                </AlertDialog.Title>
                <AlertDialog.Description className="text-sm text-muted-foreground mt-1">
                  {options.description}
                </AlertDialog.Description>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => handleResult(false)}>
                {options.cancelLabel ?? "বাতিল"}
              </Button>
              <Button
                variant={options.destructive !== false ? "destructive" : "default"}
                onClick={() => handleResult(true)}
              >
                {options.confirmLabel ?? "নিশ্চিত"}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmDialogContext.Provider>
  );
}
