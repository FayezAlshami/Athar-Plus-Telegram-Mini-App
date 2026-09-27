"use client";

import { useEffect, useState } from "react";

export function readOnlineStatus(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

/** Tracks connectivity. Starts from the current browser state. */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(readOnlineStatus);

  useEffect(() => {
    const sync = () => setOnline(readOnlineStatus());
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return online;
}
