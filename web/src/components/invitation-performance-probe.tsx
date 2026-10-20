'use client';

import { useEffect, useRef, useState } from 'react';

type TimedEntry = PerformanceEntry & {
  value?: number;
  hadRecentInput?: boolean;
  interactionId?: number;
};

// Explicit, local-only QA mode. No guest names, messages, URLs or telemetry are sent.
export default function InvitationPerformanceProbe() {
  const entries = useRef<TimedEntry[]>([]);
  const phases = useRef<
    {
      phase: string;
      atMs: number;
      coverHeightPx: number;
      documentHeightPx: number;
      replyMounted: boolean;
    }[]
  >([]);
  const frames = useRef<number[]>([]);
  const supported = useRef<string[]>([]);
  const [report, setReport] = useState('');
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;
    supported.current = [...PerformanceObserver.supportedEntryTypes];
    const observers: PerformanceObserver[] = [];
    for (const type of ['largest-contentful-paint', 'layout-shift', 'longtask', 'event']) {
      if (!supported.current.includes(type)) continue;
      const observer = new PerformanceObserver((list) => {
        entries.current.push(...(list.getEntries() as TimedEntry[]));
      });
      observer.observe({ type, buffered: true, ...(type === 'event' ? { durationThreshold: 16 } : {}) });
      observers.push(observer);
    }
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      const phase = document.querySelector('[data-phase]')?.getAttribute('data-phase');
      if (phase && phases.current.at(-1)?.phase !== phase) {
        phases.current.push({
          phase,
          atMs: Math.round(now),
          coverHeightPx: Math.round(document.querySelector('[data-phase]')!.getBoundingClientRect().height),
          documentHeightPx: document.documentElement.scrollHeight,
          replyMounted: !!document.getElementById('rsvp'),
        });
        last = 0;
      }
      if (phase === 'opening' && document.visibilityState === 'visible') {
        if (last) frames.current.push(now - last);
        last = now;
      } else last = 0;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      observers.forEach((observer) => observer.disconnect());
      cancelAnimationFrame(frame);
    };
  }, []);

  function capture() {
    const ofType = (type: string) => entries.current.filter((entry) => entry.entryType === type);
    const shifts = ofType('layout-shift').filter((entry) => !entry.hadRecentInput);
    let cls = 0;
    let session = 0;
    let start = 0;
    let previous = 0;
    for (const shift of shifts) {
      if (shift.startTime - previous > 1000 || shift.startTime - start > 5000) {
        start = shift.startTime;
        session = 0;
      }
      session += shift.value ?? 0;
      cls = Math.max(cls, session);
      previous = shift.startTime;
    }
    const opening = phases.current.find((item) => item.phase === 'opening');
    const opened = phases.current.find((item) => item.phase === 'open');
    const intervals = [...frames.current].sort((a, b) => a - b);
    const interactions = ofType('event').filter((entry) => entry.interactionId);
    const longTasks = ofType('longtask');
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    setReport(
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          scope: 'Local manual interaction sample; not field INP or a physical-device certification.',
          environment: {
            userAgent: navigator.userAgent,
            viewport: [innerWidth, innerHeight],
            pixelRatio: devicePixelRatio,
            visibility: document.visibilityState,
            reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
            supportedEntryTypes: supported.current,
          },
          phases: phases.current,
          openingDurationMs: opening && opened ? opened.atMs - opening.atMs : null,
          openingFrameSamples: intervals.length,
          openingFrameP95Ms: intervals.length
            ? Math.round(intervals[Math.ceil(intervals.length * 0.95) - 1])
            : null,
          openingFramesOver50Ms: intervals.filter((value) => value > 50).length,
          observedNavigationLcpMs: ofType('largest-contentful-paint').at(-1)?.startTime ?? null,
          observedCls: Number(cls.toFixed(4)),
          interactionEntries: interactions.length,
          maxObservedInteractionMs: interactions.length
            ? Math.max(...interactions.map((entry) => entry.duration))
            : null,
          longTasks: longTasks.map(({ startTime, duration }) => ({
            atMs: Math.round(startTime),
            durationMs: Math.round(duration),
          })),
          transferredResourceBytes: resources.reduce((sum, resource) => sum + resource.transferSize, 0),
          images: Array.from(document.images).map((image) => ({
            asset: (image.currentSrc || image.src).startsWith('data:')
              ? 'uploaded-photo'
              : new URL(image.currentSrc || image.src, location.href).pathname,
            loaded: image.complete && image.naturalWidth > 0,
          })),
        },
        null,
        2,
      ),
    );
  }
  return (
    <details
      style={{
        position: 'fixed',
        zIndex: 100,
        bottom: 8,
        right: 8,
        maxWidth: '90vw',
        background: '#fffdf8',
        color: '#451019',
        padding: 12,
        border: '1px solid #702c39',
        borderRadius: 12,
      }}
    >
      <summary>Performance QA</summary>
      <button type="button" onClick={capture} style={{ minHeight: 44 }}>
        Capture performance report
      </button>
      {report && (
        <>
          <button
            type="button"
            style={{ minHeight: 44 }}
            onClick={() => {
              const url = URL.createObjectURL(new Blob([report], { type: 'application/json' }));
              const link = document.createElement('a');
              link.href = url;
              link.download = 'invitation-performance.json';
              link.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            Download report
          </button>
          <pre
            aria-label="Performance report"
            style={{ maxHeight: '45vh', overflow: 'auto', fontSize: 11, whiteSpace: 'pre-wrap' }}
          >
            {report}
          </pre>
        </>
      )}
    </details>
  );
}
