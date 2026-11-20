"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Reglement from "./Reglement";

const SLACK = 24; // px: zoom and fractional line heights never land exactly on the bottom

/**
 * The règlement in a scrollable box inside the form. `onRead` fires once the
 * visitor has scrolled to the end, which is what unlocks the acceptance box.
 */
export default function RulesBox({ onRead }: { onRead: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const done = progress >= 1;

  const measure = () => {
    const el = bodyRef.current;
    if (!el) return;
    const scrollable = el.scrollHeight - el.clientHeight;
    const ratio = scrollable <= SLACK ? 1 : Math.min(1, el.scrollTop / (scrollable - SLACK));
    setProgress((previous) => Math.max(previous, ratio));
  };

  useEffect(() => {
    if (done) onRead();
  }, [done, onRead]);

  return (
    <div className="rules-box" style={{ "--read": progress } as CSSProperties}>
      <div className="rules-box-head">
        <span>reglement.txt</span>
        <span>{done ? "✓ lu jusqu'au bout" : `${Math.round(progress * 100)} % lu · faites défiler ↓`}</span>
      </div>
      <div className="rules-box-body" ref={bodyRef} id="rules-box" tabIndex={0} aria-label="Règlement du concours" onScroll={measure}>
        <Reglement />
      </div>
      <div className="rules-box-meter" aria-hidden="true" />
    </div>
  );
}
