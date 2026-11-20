"use client";

import Link from "next/link";
import { useRef } from "react";
import { ARTICLES } from "./Reglement";

const pad = (n: number) => String(n).padStart(2, "0");

/** Opens a native dialog with the quoted articles of the règlement. */
export default function ArticlesModal({ label, articles }: { label: string; articles: number[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const quoted = ARTICLES.filter((a) => articles.includes(a.n));
  const title = `Règlement · art. ${articles.map(pad).join(", ")}`;

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">
        {label}
        <DocIcon />
      </button>
      <dialog
        ref={dialog}
        className="articles-modal"
        aria-label={title}
        // A click on the backdrop lands on the dialog element itself.
        onClick={(event) => event.target === event.currentTarget && dialog.current?.close()}
      >
        <div className="articles-modal-head">
          <span>{title}</span>
          <button type="button" className="articles-modal-close" onClick={() => dialog.current?.close()}>
            fermer ✕
          </button>
        </div>
        <div className="articles-modal-body">
          <ol className="articles">
            {quoted.map((a) => (
              <li className="article" key={a.n}>
                <p className="article-num">Art. {pad(a.n)}</p>
                <p className="article-text">{a.text}</p>
              </li>
            ))}
          </ol>
          <Link className="arrow-link" href={`/conditions#article-${articles[0]}`}>
            Tout le règlement →
          </Link>
        </div>
      </dialog>
    </>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3.5 1.5h6l3 3v10h-9z" />
      <path d="M9.5 1.5v3h3M5.5 8h5M5.5 11h5" />
    </svg>
  );
}

export function RedirectIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M6.5 3.5h-3v9h9v-3" />
      <path d="M9 2.5h4.5V7M13.5 2.5 7 9" />
    </svg>
  );
}
