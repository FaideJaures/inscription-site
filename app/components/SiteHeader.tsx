"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ContestMark from "./ContestMark";
import { REGISTRATION_OPEN, YEAR } from "@/app/lib/contest";

const MENU = [
  { href: "/", label: "Accueil" },
  { href: "/galerie", label: "Éditions passées" },
  { href: "/conditions", label: "Règlement" },
  { href: "/faq", label: "FAQ" },
];

/** Sticky top bar with the flag stripe; below 900px the links move into a full-screen menu. */
export default function SiteHeader() {
  const path = usePathname().replace(/\/+$/, "") || "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const isCurrent = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const close = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [menuOpen]);

  return (
    <header className="site-head">
      <div className="flag-stripe" aria-hidden="true" />
      <div className="site-head-row page-wrap">
        <Link className="logo" href="/" aria-label={`MBAYA CODE CONTEST ${YEAR}, accueil`} onClick={close}>
          <ContestMark className="logo-mark" />
          <span className="logo-text">
            MBAYA<span className="logo-text-accent">_CODE</span>
          </span>
        </Link>

        <nav className="head-nav" aria-label="Navigation principale">
          <ul>
            {MENU.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="head-actions">
          <span className="head-status" data-open={REGISTRATION_OPEN || undefined}>
            <span className="status-dot" aria-hidden="true" />
            inscriptions: {REGISTRATION_OPEN ? "ouvertes" : "closes"}
          </span>
          {REGISTRATION_OPEN && (
            <Link className="button button-primary button-small head-cta" href="/inscription" onClick={close}>
              S&apos;inscrire
            </Link>
          )}
          <button
            type="button"
            className="burger"
            aria-expanded={menuOpen}
            aria-controls="menu-overlay"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
            <span className="burger-lines" data-open={menuOpen || undefined} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="menu-overlay" className="menu-overlay" data-open={menuOpen || undefined} inert={!menuOpen || undefined}>
        <ol>
          {MENU.map((item, index) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined} onClick={close}>
                <span className="menu-overlay-num">{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ol>
        {REGISTRATION_OPEN && (
          <Link className="button button-primary button-wide" href="/inscription" onClick={close}>
            S&apos;inscrire à l&apos;édition {YEAR}
          </Link>
        )}
        <p className="menu-overlay-status">
          <span className="status-dot" aria-hidden="true" /> inscriptions {REGISTRATION_OPEN ? "ouvertes" : "closes"}
        </p>
      </div>
    </header>
  );
}
