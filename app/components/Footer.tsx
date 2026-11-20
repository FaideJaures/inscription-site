"use client";

import Link from "next/link";
import ContestMark from "./ContestMark";
import { useTheme, type ThemeChoice } from "@/app/lib/theme";
import { CONTACT_PHONE, CONTACT_PHONE_HREF, CONTEST_NAME, EDITION_LABEL, REGISTRATION_OPEN, YEAR } from "@/app/lib/contest";

const THEMES: [ThemeChoice, string][] = [
  ["light", "Clair"],
  ["dark", "Sombre"],
  ["auto", "Système"],
];

export default function Footer() {
  const { choice, choose } = useTheme();

  return (
    <footer className="site-foot">
      <div className="flag-stripe" aria-hidden="true" />
      <div className="site-foot-grid page-wrap">
        <div className="foot-brand">
          <ContestMark className="foot-mark" />
          <p>
            Le concours de programmation du club de programmation de l&apos;école (CPE). {EDITION_LABEL}, {YEAR}.
          </p>
        </div>

        <nav className="foot-col" aria-label="Plan du site">
          <p className="foot-title">{"// pages"}</p>
          <ul>
            <li>
              <Link href="/">Accueil</Link>
            </li>
            {REGISTRATION_OPEN && (
              <li>
                <Link href="/inscription">Inscription</Link>
              </li>
            )}
            <li>
              <Link href="/galerie">Éditions passées</Link>
            </li>
            <li>
              <Link href="/conditions">Règlement</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
          </ul>
        </nav>

        <div className="foot-col">
          <p className="foot-title">{"// contact"}</p>
          <p>
            <a href={CONTACT_PHONE_HREF}>{CONTACT_PHONE}</a>
          </p>
          <p className="foot-title">{"// thème"}</p>
          <div className="theme-switch" role="radiogroup" aria-label="Thème d'affichage">
            {THEMES.map(([value, label]) => (
              <button key={value} type="button" role="radio" aria-checked={choice === value} onClick={() => choose(value)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="site-foot-base page-wrap">
        <p>
          © {YEAR} {CONTEST_NAME}. Tous droits réservés.
        </p>
        <a className="foot-top" href="#top">
          haut de page ↑
        </a>
      </div>
    </footer>
  );
}
