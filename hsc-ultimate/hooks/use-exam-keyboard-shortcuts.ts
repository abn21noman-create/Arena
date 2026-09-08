"use client";

import { useEffect, useCallback } from "react";
import { openScientificCalculator } from "@/components/shared/scientific-calculator";
import { openKeyboardShortcutsGuide } from "@/components/shared/keyboard-shortcuts-dialog";
import { sfx } from "@/lib/sound-effects";

interface UseExamKeyboardShortcutsProps {
  onSelectOption?: (optionIndex: number) => void;
  onSubmit?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleFlag?: () => void;
  onToggleOmr?: () => void;
  disabled?: boolean;
  optionsCount?: number;
}

export function useExamKeyboardShortcuts({
  onSelectOption,
  onSubmit,
  onNext,
  onPrev,
  onToggleFlag,
  onToggleOmr,
  disabled = false,
  optionsCount = 4,
}: UseExamKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      // Ignore when user is actively typing inside input, textarea, or contentEditable
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      // Number keys 1-4
      if (["1", "2", "3", "4"].includes(key)) {
        const index = parseInt(key, 10) - 1;
        if (index < optionsCount && onSelectOption) {
          event.preventDefault();
          sfx.play("click");
          onSelectOption(index);
        }
        return;
      }

      // Letter keys A-D
      if (["a", "b", "c", "d"].includes(key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // 'c' might be calculator if options are not 4, but let's check
        // If a/b/c/d is pressed alone during MCQ, select option:
        const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
        const index = map[key];
        if (index !== undefined && index < optionsCount && onSelectOption) {
          event.preventDefault();
          sfx.play("click");
          onSelectOption(index);
          return;
        }
      }

      // Enter to submit
      if (event.key === "Enter" && onSubmit) {
        event.preventDefault();
        onSubmit();
        return;
      }

      // Space or ArrowRight to go next
      if ((event.key === "ArrowRight" || event.key === " ") && onNext) {
        event.preventDefault();
        onNext();
        return;
      }

      // ArrowLeft to go previous
      if (event.key === "ArrowLeft" && onPrev) {
        event.preventDefault();
        onPrev();
        return;
      }

      // 'm' or 'f' to toggle flag/mark
      if (key === "m" || key === "f") {
        if (onToggleFlag) {
          event.preventDefault();
          sfx.play("click");
          onToggleFlag();
        }
        return;
      }

      // 'o' to open OMR sheet
      if (key === "o") {
        if (onToggleOmr) {
          event.preventDefault();
          sfx.play("click");
          onToggleOmr();
        }
        return;
      }

      // '?' or 'h' for keyboard shortcuts guide
      if (event.key === "?" || key === "h") {
        event.preventDefault();
        openKeyboardShortcutsGuide();
        return;
      }
    },
    [
      disabled,
      optionsCount,
      onSelectOption,
      onSubmit,
      onNext,
      onPrev,
      onToggleFlag,
      onToggleOmr,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
