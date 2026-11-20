"use client";

import { useEffect, useState } from "react";
import { ARTICLES } from "./Reglement";

const pad = (n: number) => String(n).padStart(2, "0");

/** Sticky list of the 13 articles; the one being read is highlighted. */
export default function RulesIndex() {
  const [reading, setReading] = useState(1);

  useEffect(() => {
    const targets = ARTICLES.map((a) => document.getElementById(`article-${a.n}`)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setReading(Number(top.target.id.replace("article-", "")));
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="rules-index" aria-label="Articles du règlement">
      <p className="rules-index-title">{"// index"}</p>
      <ol>
        {ARTICLES.map((a) => (
          <li key={a.n}>
            <a href={`#article-${a.n}`} aria-current={reading === a.n ? "location" : undefined}>
              art. {pad(a.n)}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
