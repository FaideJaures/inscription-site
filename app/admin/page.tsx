"use client";

import { Fragment, useMemo, useState } from "react";
import { EDITION, YEAR } from "../lib/contest";
import { levelLabel } from "../lib/registration";
import type { AdminRegistration } from "../lib/admin-types";

type Scope = "current" | "archive";

const formatDate = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

const csvCell = (value: string | number) => `"${String(value ?? "").replace(/"/g, '""')}"`;

/** One line per participant: what an organiser pastes into a spreadsheet. */
function toCsv(registrations: AdminRegistration[]) {
  const header = [
    "Inscription", "Type", "Date", "Projet", "Langages", "Membre", "Référent",
    "Prénom", "Nom", "Sexe", "Téléphone", "E-mail", "Établissement", "Niveau", "Spécialité",
  ];
  const lines = registrations.flatMap((r) =>
    r.members.map((m, i) =>
      [
        r.groupName, r.registrationType, r.createdAt, r.project.titre, r.project.langages, i + 1, i === 0 ? "oui" : "",
        m.prenom, m.nom, m.sexe, m.telephone, m.email, m.etablissement, m.niveau, m.specialite,
      ].map(csvCell).join(";"),
    ),
  );
  // BOM so Excel opens the accents correctly.
  return "﻿" + [header.map(csvCell).join(";"), ...lines].join("\r\n");
}

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope>("current");
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [query, setQuery] = useState("");
  const [openRow, setOpenRow] = useState<string | null>(null);

  async function load(nextScope: Scope = scope) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, scope: nextScope }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.message ?? "Connexion impossible.");
        if (response.status === 401) setAuthed(false);
        return;
      }
      setRegistrations(payload.registrations);
      setScope(nextScope);
      setAuthed(true);
    } catch {
      setError("Serveur injoignable. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  const logout = () => {
    setAuthed(false);
    setRegistrations([]);
    setPassword("");
    setQuery("");
    setScope("current");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return registrations;
    return registrations.filter((r) =>
      [r.groupName, r.email, r.project.titre, r.project.langages, ...r.members.flatMap((m) => [m.nom, m.prenom, m.email, m.telephone, m.etablissement])]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [registrations, query]);

  const stats = useMemo(() => {
    const solo = registrations.filter((r) => r.registrationType === "solo").length;
    const members = registrations.flatMap((r) => r.members);
    return {
      total: registrations.length,
      solo,
      groups: registrations.length - solo,
      participants: members.length,
      women: members.filter((m) => m.sexe === "F").length,
      schools: new Set(members.map((m) => m.etablissement.trim().toUpperCase()).filter(Boolean)).size,
    };
  }, [registrations]);

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mbaya-inscriptions-${scope === "current" ? YEAR : YEAR - 1}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <main id="top" className="page-wrap admin-login-page">
        <form
          className="admin-login"
          onSubmit={(e) => {
            e.preventDefault();
            load("current");
          }}
        >
          <div className="terminal-bar">
            <span className="terminal-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="terminal-title">cpe@mbaya: ~/admin</span>
          </div>
          <div className="admin-login-body">
            <p className="sec-label">{"// espace organisateurs"}</p>
            <h1>Connexion</h1>
            <p className="admin-login-lead">Les inscriptions de l&apos;édition {YEAR}, et l&apos;archive de l&apos;édition précédente.</p>
            <div className="field">
              <label htmlFor="admin-email">E-mail</label>
              <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="admin-password">Mot de passe</label>
              <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && (
              <p className="send-error" role="alert">
                {error}
              </p>
            )}
            <button className="button button-primary button-wide" type="submit" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </div>
        </form>
      </main>
    );
  }

  const plural = (n: number, word: string) => `${word}${n > 1 ? "s" : ""}`;
  const shownYear = scope === "current" ? YEAR : YEAR - 1;
  const toggle = (id: string) => setOpenRow((current) => (current === id ? null : id));

  return (
    <main id="top" className="page-wrap admin">
      <header className="admin-head">
        <div>
          <p className="sec-label">{`// admin — édition ${scope === "current" ? EDITION : EDITION - 1}`}</p>
          <h1>Inscriptions {shownYear}</h1>
        </div>
        <div className="button-row">
          <button type="button" className="button button-outline button-small" onClick={() => load()} disabled={loading}>
            {loading ? "Actualisation…" : "Actualiser"}
          </button>
          <button type="button" className="button button-outline button-small" onClick={exportCsv} disabled={filtered.length === 0}>
            Exporter CSV
          </button>
          <button type="button" className="button button-outline button-small" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </header>

      <div className="tabs" role="tablist" aria-label="Édition affichée">
        {(
          [
            ["current", `edition_${YEAR}/`],
            ["archive", `archive_${YEAR - 1}/`],
          ] as const
        ).map(([value, label]) => (
          <button key={value} type="button" role="tab" className="tab" aria-selected={scope === value} onClick={() => load(value)}>
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="send-error" role="alert">
          {error}
        </p>
      )}

      <ul className="admin-stats">
        <li>
          <strong>{stats.total}</strong> {plural(stats.total, "inscription")} <span>({stats.solo} solo · {stats.groups} {plural(stats.groups, "équipe")})</span>
        </li>
        <li>
          <strong>{stats.participants}</strong> {plural(stats.participants, "participant")} <span>(dont {stats.women} {plural(stats.women, "femme")})</span>
        </li>
        <li>
          <strong>{stats.schools}</strong> {plural(stats.schools, "établissement")}
        </li>
        <li>
          <strong>{filtered.length}</strong> {plural(filtered.length, "affichée")}
        </li>
      </ul>

      <div className="field admin-search">
        <label htmlFor="admin-search">Rechercher</label>
        <input
          id="admin-search"
          type="search"
          placeholder="Nom, équipe, projet, établissement, e-mail…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">{registrations.length === 0 ? "Aucune inscription pour le moment." : "Aucun résultat."}</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Détails</span>
                </th>
                <th scope="col">Type</th>
                <th scope="col">Nom</th>
                <th scope="col">Référent</th>
                <th scope="col">Établissement</th>
                <th scope="col">Projet</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const lead = r.members[0];
                const open = openRow === r.id;
                return (
                  <Fragment key={r.id}>
                    <tr className="admin-row" data-open={open || undefined} onClick={() => toggle(r.id)}>
                      <td>
                        <button
                          type="button"
                          className="row-toggle"
                          aria-expanded={open}
                          aria-controls={`detail-${r.id}`}
                          aria-label={open ? "Masquer le détail" : "Afficher le détail"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(r.id);
                          }}
                        >
                          {open ? "−" : "+"}
                        </button>
                      </td>
                      <td>
                        <span className="type-tag" data-type={r.registrationType}>
                          {r.registrationType === "groupe" ? `équipe ×${r.members.length}` : "solo"}
                        </span>
                      </td>
                      <td>{r.groupName || "—"}</td>
                      <td>{lead ? `${lead.prenom} ${lead.nom}`.trim() : "—"}</td>
                      <td>{lead?.etablissement || "—"}</td>
                      <td>{r.project.titre || "—"}</td>
                      <td className="nowrap">{formatDate(r.createdAt)}</td>
                    </tr>
                    {open && (
                      <tr className="admin-detail" id={`detail-${r.id}`}>
                        <td colSpan={7}>
                          <div className="detail-grid">
                            <section className="detail-card">
                              <h3>Projet</h3>
                              <dl>
                                <dt>Titre</dt>
                                <dd>{r.project.titre || "—"}</dd>
                                <dt>Description</dt>
                                <dd className="pre">{r.project.descriptif || "—"}</dd>
                                <dt>Langages</dt>
                                <dd>{r.project.langages || "—"}</dd>
                                <dt>Autres</dt>
                                <dd className="pre">{r.project.autres && r.project.autres !== "None" ? r.project.autres : "—"}</dd>
                                <dt>Contact</dt>
                                <dd>
                                  <a href={`mailto:${r.email}`}>{r.email}</a>
                                </dd>
                                <dt>Identifiant</dt>
                                <dd className="mono">{r.id}</dd>
                              </dl>
                            </section>
                            {r.members.map((m, i) => (
                              <section className="detail-card" key={`${r.id}-${i}`}>
                                <h3>{r.registrationType === "solo" ? "Participant" : `Membre ${i + 1}${i === 0 ? " · référent" : ""}`}</h3>
                                <dl>
                                  <dt>Nom</dt>
                                  <dd>{`${m.prenom} ${m.nom}`.trim() || "—"}</dd>
                                  <dt>Sexe</dt>
                                  <dd>{m.sexe === "F" ? "Féminin" : m.sexe === "M" ? "Masculin" : "—"}</dd>
                                  <dt>Téléphone</dt>
                                  <dd>{m.telephone ? <a href={`tel:${m.telephone.replace(/\s/g, "")}`}>{m.telephone}</a> : "—"}{m.phoneVerified && " ✓ vérifié"}</dd>
                                  <dt>E-mail</dt>
                                  <dd>{m.email ? <a href={`mailto:${m.email}`}>{m.email}</a> : "—"}{m.emailVerified && " ✓ vérifié"}</dd>
                                  <dt>Établissement</dt>
                                  <dd>{m.etablissement || "—"}</dd>
                                  <dt>Niveau</dt>
                                  <dd>{m.niveau ? levelLabel(m.niveau) : "—"}</dd>
                                  <dt>Spécialité</dt>
                                  <dd>{m.specialite || "—"}</dd>
                                </dl>
                              </section>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
