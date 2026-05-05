"use client";

import { useCallback, useEffect, useState } from "react";

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
        <div
          className="swatches"
          role="group"
          aria-labelledby="tweaks-accent-label"
        >
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
  const [accentHue, setAccentHue] = useState(TWEAK_DEFAULTS.accentHue);
  const [monoFont, setMonoFont] = useState(TWEAK_DEFAULTS.monoFont);
  const [tweaksVisible, setTweaksVisible] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydrate from localStorage */
    const storedAccent = localStorage.getItem("blog-accent-hue");
    const storedMono = localStorage.getItem("blog-mono-font");
    if (storedAccent) {
      const n = Number(storedAccent);
      if (!Number.isNaN(n)) setAccentHue(n);
    }
    if (storedMono) setMonoFont(storedMono);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--accent",
      `oklch(0.72 0.14 ${accentHue})`,
    );
    document.documentElement.style.setProperty(
      "--accent-dim",
      `oklch(0.72 0.14 ${accentHue} / 0.18)`,
    );
    localStorage.setItem("blog-accent-hue", String(accentHue));
  }, [accentHue]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--mono",
      `'${monoFont}', ui-monospace, SFMono-Regular, Menlo, monospace`,
    );
    localStorage.setItem("blog-mono-font", monoFont);
  }, [monoFont]);

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

  const setAccent = useCallback((hue: number) => {
    setAccentHue(hue);
    persistTweak({ accentHue: hue });
  }, []);

  const setMono = useCallback((f: string) => {
    setMonoFont(f);
    persistTweak({ monoFont: f });
  }, []);

  return (
    <TweaksPanel
      visible={tweaksVisible}
      accent={accentHue}
      setAccent={setAccent}
      mono={monoFont}
      setMono={setMono}
    />
  );
}
