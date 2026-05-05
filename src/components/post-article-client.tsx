"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/locales";
import { estimateSpeechDurationSeconds, remainingFromCharIndex } from "@/lib/estimated-speech-duration";
import type { Post, PostArticleClientUi } from "@/lib/types";
import { ArrowBack, PauseIcon, PlayIcon } from "./icons";
import { PostBodyMarkdown } from "./post-body-markdown";
import { buildSpeakableTextModelFromMarkdown } from "@/lib/speakable-text";

type Props = {
  post: Post;
  lang: Locale;
  ui: PostArticleClientUi;
};

function speechLangForLocale(lang: Locale): string {
  if (lang === "en") return "en-US";
  return lang;
}

function formatEtaSeconds(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function normalizedBcp47(lang: string | undefined): string {
  if (!lang) return "";
  return lang.replace(/_/g, "-").trim().toLowerCase();
}

/** Prefer exact BCP-47 match, then same primary language; within tier prefer local voices, then stable name order. */
function pickVoice(speechLang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const target = normalizedBcp47(speechLang);
  const primary = (target.split("-")[0] ?? target) || target;

  const exact = voices.filter((v) => normalizedBcp47(v.lang) === target);
  const fallback = voices.filter((v) => {
    const nl = normalizedBcp47(v.lang);
    return nl.startsWith(`${primary}-`) || nl === primary;
  });

  function rank(a: SpeechSynthesisVoice, b: SpeechSynthesisVoice): number {
    const localFirst = (v: SpeechSynthesisVoice) => (v.localService === true ? 1 : 0);
    const d = localFirst(b) - localFirst(a);
    if (d !== 0) return d;
    return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
  }

  exact.sort(rank);
  if (exact.length > 0) return exact[0]!;

  fallback.sort(rank);
  return fallback.length > 0 ? fallback[0]! : null;
}

export function PostArticleClient({ post, lang, ui }: Props) {
  const speechLang = useMemo(() => speechLangForLocale(lang), [lang]);

  const model = useMemo(
    () => buildSpeakableTextModelFromMarkdown(post.bodyMarkdown),
    [post.bodyMarkdown],
  );

  /** Shown on the slider; can differ from applied while user adjusts before commit. */
  const [sliderRate, setSliderRate] = useState<number>(1);
  /** Drives SpeechSynthesis + duration; updates only after pointer/key release + delay. */
  const [appliedRate, setAppliedRate] = useState<number>(1);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  /** Bumps when `voiceschanged` fires so we re-pick voice / restart the current utterance if needed. */
  const [voicesTick, setVoicesTick] = useState(0);

  const sliderRateRef = useRef(1);
  const rateCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pausedRef = useRef(false);
  const segmentStartAbsoluteRef = useRef(0);
  const resumeCharRef = useRef(0);
  const totalEstRef = useRef(0);
  const utteranceLengthRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const cancelPendingRateCommit = useCallback(() => {
    if (rateCommitTimerRef.current !== null) {
      clearTimeout(rateCommitTimerRef.current);
      rateCommitTimerRef.current = null;
    }
  }, []);

  const scheduleAppliedRateCommit = useCallback(() => {
    cancelPendingRateCommit();
    const valueAtRelease = sliderRateRef.current;
    rateCommitTimerRef.current = setTimeout(() => {
      rateCommitTimerRef.current = null;
      setAppliedRate(valueAtRelease);
    }, 2000);
  }, [cancelPendingRateCommit]);

  useEffect(() => () => cancelPendingRateCommit(), [cancelPendingRateCommit]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    const onVoicesChanged = () => setVoicesTick((t) => t + 1);
    synth.addEventListener("voiceschanged", onVoicesChanged);
    // Reading the list primes voice loading on Chromium; `voiceschanged` fires when the list is ready.
    synth.getVoices();
    return () => synth.removeEventListener("voiceschanged", onVoicesChanged);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    pausedRef.current = false;
    setSpeaking(false);
    setPaused(false);
    setRemainingSeconds(null);
  }, []);

  const startFromAbsoluteChar = useCallback(
    (absoluteChar: number, opts?: { keepPaused?: boolean }) => {
      if (typeof window === "undefined") return;

      const text = model.plainText.slice(absoluteChar);
      if (text.trim().length === 0) return;

      window.speechSynthesis.cancel();

      const totalEst = estimateSpeechDurationSeconds(text, appliedRate, lang);
      totalEstRef.current = totalEst;
      utteranceLengthRef.current = text.length;
      segmentStartAbsoluteRef.current = absoluteChar;
      resumeCharRef.current = absoluteChar;

      setRemainingSeconds(totalEst);

      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechLang;
      u.rate = appliedRate;

      const voice = pickVoice(speechLang);
      if (voice) u.voice = voice;

      u.onboundary = (e) => {
        if (pausedRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyE: any = e;
        const charIndex: unknown = anyE?.charIndex;
        if (typeof charIndex !== "number" || utteranceLengthRef.current <= 0) return;

        resumeCharRef.current = segmentStartAbsoluteRef.current + charIndex;
        const remaining = remainingFromCharIndex(totalEstRef.current, charIndex, utteranceLengthRef.current);
        setRemainingSeconds(remaining);
      };

      u.onend = () => {
        utteranceRef.current = null;
        setSpeaking(false);
        setPaused(false);
        pausedRef.current = false;
        setRemainingSeconds(null);
      };

      u.onerror = () => {
        utteranceRef.current = null;
        setSpeaking(false);
        setPaused(false);
        pausedRef.current = false;
        setRemainingSeconds(null);
      };

      utteranceRef.current = u;
      setSpeaking(true);
      const stayPaused = Boolean(opts?.keepPaused);
      if (stayPaused) {
        pausedRef.current = true;
        setPaused(true);
      } else {
        pausedRef.current = false;
        setPaused(false);
      }

      // Pausing synchronously after speak() breaks pause/resume in WebKit/Chromium until the tab is closed.
      // Wait until playback has actually started before pausing.
      u.onstart = () => {
        if (!stayPaused) return;
        window.speechSynthesis.pause();
      };

      window.speechSynthesis.speak(u);
    },
    [appliedRate, lang, model.plainText, speechLang],
  );

  const toggle = useCallback(() => {
    const synth = window.speechSynthesis;
    if (speaking) {
      if (paused) {
        synth.resume();
        pausedRef.current = false;
        setPaused(false);
      } else {
        synth.pause();
        pausedRef.current = true;
        setPaused(true);
      }
      return;
    }
    resumeCharRef.current = 0;
    startFromAbsoluteChar(0);
  }, [paused, speaking, startFromAbsoluteChar]);

  useEffect(() => {
    if (!speaking) return;
    startFromAbsoluteChar(resumeCharRef.current, { keepPaused: pausedRef.current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedRate, voicesTick]);

  useEffect(() => stop, [stop]);

  const etaAria =
    remainingSeconds != null ? ui.listenEtaAria.replace("{{time}}", formatEtaSeconds(remainingSeconds)) : undefined;

  const listenButtonAria =
    speaking && paused
      ? ui.listenResumeAria
      : speaking
        ? ui.listenPauseAria
        : ui.listenToggleAria;

  return (
    <article className="post-detail">
      <div className="post-detail-toolbar">
        <Link className="back-link" href={`/${lang}`}>
          <ArrowBack /> {ui.recent}
        </Link>

        <div className="listen-controls">
          <button
            type="button"
            className="listen-toggle"
            onClick={toggle}
            aria-label={listenButtonAria}
            aria-pressed={speaking && !paused}
            data-playing={speaking && !paused ? "true" : undefined}
          >
            {speaking && !paused ? <PauseIcon /> : <PlayIcon />}
          </button>

          <label className="listen-speed">
            <span className="listen-speed-label">{ui.listenSpeedLabel}</span>
            <input
              type="range"
              min={0.75}
              max={2}
              step={0.05}
              value={sliderRate}
              aria-valuetext={`${sliderRate.toFixed(2)}×`}
              onPointerDown={() => cancelPendingRateCommit()}
              onPointerUp={() => scheduleAppliedRateCommit()}
              onKeyUp={(e) => {
                if (
                  e.key === "ArrowLeft" ||
                  e.key === "ArrowRight" ||
                  e.key === "Home" ||
                  e.key === "End" ||
                  e.key === "PageUp" ||
                  e.key === "PageDown"
                ) {
                  scheduleAppliedRateCommit();
                }
              }}
              onChange={(e) => {
                const v = Number(e.target.value);
                sliderRateRef.current = v;
                setSliderRate(v);
              }}
            />
            <span className="listen-speed-value">{sliderRate.toFixed(2)}×</span>
          </label>

          {remainingSeconds != null ? (
            <span className="listen-eta" role="status" aria-live="polite" aria-label={etaAria}>
              ~{formatEtaSeconds(remainingSeconds)} <span className="listen-eta-approx">{ui.listenEtaApprox}</span>
            </span>
          ) : null}
        </div>
      </div>

      <h1>{post.title}</h1>
      <div className="post-meta">
        <span>{ui.formattedDate}</span>
        <span className="dot" aria-hidden="true" />
        <span>
          {post.minutes} {ui.readingTime}
        </span>
      </div>

      <PostBodyMarkdown markdown={post.bodyMarkdown} />

      <div className="post-tags" style={{ marginTop: 40 }}>
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/${lang}?tag=${encodeURIComponent(tag)}`}
            className="tag"
            scroll={false}
            onClick={() => stop()}
          >
            {tag}
          </Link>
        ))}
      </div>
    </article>
  );
}
