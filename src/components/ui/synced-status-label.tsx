"use client";

import { useEffect, useState } from "react";

import type { NetworkQuality } from "@/types";

type Quality = NetworkQuality;

type NetworkConnection = {
  effectiveType?: string;
  downlink?: number;
  addEventListener(type: "change", listener: () => void): void;
  removeEventListener(type: "change", listener: () => void): void;
};

function getNetworkConnection(): NetworkConnection | undefined {
  return (navigator as Navigator & { connection?: NetworkConnection }).connection;
}

function readQuality(): Quality {
  if (typeof navigator === "undefined") return "pending";
  if (!navigator.onLine) return "offline";

  const c = getNetworkConnection();
  if (!c || !("effectiveType" in c) || !c.effectiveType) {
    return "good";
  }

  const et = c.effectiveType;
  if (et === "4g") {
    const dl = c.downlink;
    if (typeof dl === "number" && dl > 0 && dl < 0.55) return "medium";
    return "good";
  }
  if (et === "3g") return "medium";
  if (et === "2g" || et === "slow-2g") return "bad";
  return "good";
}

const modifier: Record<Quality, string> = {
  pending: "graph-dot--pending",
  offline: "graph-dot--offline",
  good: "graph-dot--good",
  medium: "graph-dot--medium",
  bad: "graph-dot--bad",
};

export function SyncedStatusLabel({
  syncedLabel,
  networkStatus,
}: {
  syncedLabel: string;
  networkStatus: Record<Quality, string>;
}) {
  const [quality, setQuality] = useState<Quality>("pending");

  useEffect(() => {
    queueMicrotask(() => setQuality(readQuality()));

    const refresh = () => setQuality(readQuality());

    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);

    const conn = getNetworkConnection();
    conn?.addEventListener("change", refresh);

    return () => {
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      conn?.removeEventListener("change", refresh);
    };
  }, []);

  const ariaLabel = `${syncedLabel}. ${networkStatus[quality]}.`;

  return (
    <span
      className={`graph-dot ${modifier[quality]}`}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <span aria-hidden="true">{syncedLabel}</span>
    </span>
  );
}
