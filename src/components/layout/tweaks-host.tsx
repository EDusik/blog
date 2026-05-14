"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const ACCENT_OPTIONS = [
  { name: "lilac", hue: 300 },
  { name: "cyan", hue: 220 },
  { name: "mint", hue: 160 },
  { name: "amber", hue: 70 },
  { name: "rose", hue: 20 },
] as const;

const TWEAK_DEFAULTS: { accentHue: number; monoFont: string } = {
  accentHue: 300,
  monoFont: "JetBrains Mono",
};

const LS_ACCENT_KEY = "blog-accent-hue";
const LS_MONO_KEY = "blog-mono-font";

const serverSnapshot: { accentHue: number; monoFont: string } = {
  accentHue: TWEAK_DEFAULTS.accentHue,
  monoFont: TWEAK_DEFAULTS.monoFont,
};

let clientSnapshot: { accentHue: number; monoFont: string } = serverSnapshot;
const tweakListeners = new Set<() => void>();
let didReadLocalStorage = false;

function getServerSnapshot() {
  return serverSnapshot;
}

function getSnapshot() {
  return clientSnapshot;
}

function emitTweakListeners() {
  for (const l of [...tweakListeners]) l();
}

function applyAccentToDocument(accentHue: number) {
  document.documentElement.style.setProperty(
    "--accent",
    `oklch(0.72 0.14 ${accentHue})`
  );
  document.documentElement.style.setProperty(
    "--accent-dim",
    `oklch(0.72 0.14 ${accentHue} / 0.18)`
  );
}

function applyMonoToDocument(monoFont: string) {
  document.documentElement.style.setProperty(
    "--mono",
    `'${monoFont}', ui-monospace, SFMono-Regular, Menlo, monospace`
  );
}

function hydrateFromLocalStorageOnce(): boolean {
  if (typeof window === "undefined" || didReadLocalStorage) return false;
  didReadLocalStorage = true;

  let accentHue = clientSnapshot.accentHue;
  let monoFont = clientSnapshot.monoFont;
  let valuesChanged = false;

  const storedAccent = localStorage.getItem(LS_ACCENT_KEY);
  if (storedAccent) {
    const n = Number(storedAccent);
    if (!Number.isNaN(n) && n !== accentHue) {
      accentHue = n;
      valuesChanged = true;
    }
  }
  const storedMono = localStorage.getItem(LS_MONO_KEY);
  if (storedMono && storedMono !== monoFont) {
    monoFont = storedMono;
    valuesChanged = true;
  }

  if (valuesChanged) {
    clientSnapshot = { accentHue, monoFont };
  }

  applyAccentToDocument(clientSnapshot.accentHue);
  applyMonoToDocument(clientSnapshot.monoFont);

  return valuesChanged;
}

function subscribeTweakStore(onStoreChange: () => void) {
  tweakListeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    const changed = hydrateFromLocalStorageOnce();
    if (changed) {
      queueMicrotask(() => emitTweakListeners());
    }
  }
  return () => tweakListeners.delete(onStoreChange);
}

function setAccentHue(hue: number) {
  if (clientSnapshot.accentHue === hue) return;
  clientSnapshot = { ...clientSnapshot, accentHue: hue };
  applyAccentToDocument(hue);
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_ACCENT_KEY, String(hue));
  }
  persistTweak({ accentHue: hue });
  emitTweakListeners();
}

function setMonoFont(font: string) {
  if (clientSnapshot.monoFont === font) return;
  clientSnapshot = { ...clientSnapshot, monoFont: font };
  applyMonoToDocument(font);
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_MONO_KEY, font);
  }
  persistTweak({ monoFont: font });
  emitTweakListeners();
}

function TweaksPanel({
  visible,
  accent,
  setAccent,
  mono,
  setMono,
}: {
  visible: boolean;
  accent: number;
  setAccent: (hue: number) => void;
  mono: string;
  setMono: (font: string) => void;
}) {
  const monoId = "tweaks-mono-font";
  return (
    <div className={"tweaks-panel" + (visible ? " visible" : "")}>
      <h3>tweaks</h3>
      <div className="row">
        <span id="tweaks-accent-label">accent</span>
        <div className="swatches" role="group" aria-labelledby="tweaks-accent-label">
          {ACCENT_OPTIONS.map((opt) => (
            <span
              key={opt.name}
              className={"swatch" + (accent === opt.hue ? " active" : "")}
              style={{ background: `oklch(0.72 0.14 ${opt.hue})` }}
              onClick={() => setAccent(opt.hue)}
              title={opt.name}
              role="button"
              tabIndex={0}
              aria-label={`Accent: ${opt.name}`}
              aria-pressed={accent === opt.hue}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setAccent(opt.hue);
              }}
            />
          ))}
        </div>
      </div>
      <div className="row">
        <label htmlFor={monoId}>mono font</label>
        <select
          id={monoId}
          value={mono}
          onChange={(e) => setMono(e.target.value)}
          style={{
            background: "var(--surface-2)",
            color: "var(--text)",
            border: "1px solid var(--line)",
            borderRadius: 4,
            fontFamily: "var(--mono)",
            fontSize: 11,
            padding: "2px 6px",
          }}
        >
          <option value="JetBrains Mono">JetBrains Mono</option>
          <option value="Fira Code">Fira Code</option>
          <option value="IBM Plex Mono">IBM Plex Mono</option>
          <option value="Geist Mono">Geist Mono</option>
        </select>
      </div>
    </div>
  );
}

function persistTweak(edits: { accentHue?: number; monoFont?: string }) {
  if (typeof window === "undefined") return;
  if (window.parent !== window) {
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits }, "*");
  }
}

export function TweaksHost() {
  const { accentHue, monoFont } = useSyncExternalStore(
    subscribeTweakStore,
    getSnapshot,
    getServerSnapshot
  );
  const [tweaksVisible, setTweaksVisible] = useState(false);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setTweaksVisible(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksVisible(false);
    };
    window.addEventListener("message", handler);
    if (window.parent !== window) {
      window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    }
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <TweaksPanel
      visible={tweaksVisible}
      accent={accentHue}
      setAccent={setAccentHue}
      mono={monoFont}
      setMono={setMonoFont}
    />
  );
}
