"use client";

import { useEffect, useState } from "react";
import { EDITION_LABEL, YEAR } from "@/app/lib/contest";

type Stats = { registrations: number; participants: number; schools: number };

const REFRESH_MS = 30_000;

/**
 * The edition's live counters, printed as the output of a terminal command.
 * Aggregates only. If the database can't be reached the numbers show "—"
 * rather than a misleading zero.
 */
export default function TerminalStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let stopped = false;
    const refresh = async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Stats;
        if (!stopped) {
          setStats(data);
          setOffline(false);
        }
      } catch {
        if (!stopped) setOffline(true);
      }
    };
    refresh();
    const timer = window.setInterval(() => document.visibilityState === "visible" && refresh(), REFRESH_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, []);

  const show = (n?: number) => (stats && n !== undefined ? n.toLocaleString("fr-FR") : "—");
  const lines: [string, number | undefined][] = [
    ["inscriptions", stats?.registrations],
    ["participants", stats?.participants],
    ["établissements", stats?.schools],
  ];

  return (
    <figure className="terminal" aria-label="Chiffres de l'édition en direct">
      <div className="terminal-bar">
        <span className="terminal-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="terminal-title">cpe@mbaya: ~/edition-{YEAR}</span>
      </div>
      <div className="terminal-body">
        <p className="terminal-cmd">
          <span className="terminal-prompt">$</span> mbaya stats --edition {YEAR}
        </p>
        <dl className="terminal-out" aria-live="polite">
          {lines.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{show(value)}</dd>
            </div>
          ))}
        </dl>
        <p className="terminal-note">
          {offline
            ? "# compteurs momentanément indisponibles"
            : `# ${EDITION_LABEL} · actualisé toutes les 30 s · aucune donnée personnelle`}
        </p>
        <p className="terminal-cmd">
          <span className="terminal-prompt">$</span> <span className="terminal-cursor" aria-hidden="true" />
        </p>
      </div>
    </figure>
  );
}
