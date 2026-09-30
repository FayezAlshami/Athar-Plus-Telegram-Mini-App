"use client";

import { useEffect, useState } from "react";

const NON_TEXT_INPUTS = new Set(["button", "checkbox", "radio", "range", "submit", "reset", "file", "color"]);

function isTextEntry(element: Element | null): boolean {
  if (element instanceof HTMLTextAreaElement) return true;
  if (element instanceof HTMLInputElement) return !NON_TEXT_INPUTS.has(element.type);
  return element instanceof HTMLElement && element.isContentEditable;
}

/**
 * Best-effort on-screen keyboard signal for touch devices: a text field has focus.
 * Used to move fixed bars out of the way instead of letting them ride on the keyboard.
 */
export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const sync = () => setOpen(isTextEntry(document.activeElement));
    // focusout fires before focus lands on the next element; read it on the next frame.
    const onFocusOut = () => requestAnimationFrame(sync);
    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", sync);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return open;
}
