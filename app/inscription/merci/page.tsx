import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../../components/Footer";
import { CONTACT_PHONE, CONTACT_PHONE_HREF, EDITION_LABEL, EVENT_DATE_LABEL, YEAR } from "../../lib/contest";

export const metadata: Metadata = {
  title: "Inscription enregistrée",
  robots: { index: false },
};

export default async function MerciPage({ searchParams }: { searchParams: Promise<{ type?: string; nom?: string }> }) {
  const { type, nom } = await searchParams;
  const team = type === "groupe";
  // Shown as plain text only, and capped: it comes from the URL.
  const name = typeof nom === "string" ? nom.slice(0, 80) : "";
  const title = name ? (team ? `L'équipe ${name} est inscrite.` : `C'est noté, ${name}.`) : "Vous êtes inscrits.";

  return (
    <main id="top">
      <section className="page-wrap receipt-page">
        <div className="receipt">
          <div className="terminal-bar">
            <span className="terminal-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="terminal-title">mbaya register --edition {YEAR}</span>
          </div>
          <div className="receipt-body">
            <p className="receipt-ok">✓ inscription enregistrée</p>
            <h1>{title}</h1>
            <dl className="receipt-lines">
              <div>
                <dt>formule</dt>
                <dd>{team ? "équipe" : "solo"}</dd>
              </div>
              {name && (
                <div>
                  <dt>{team ? "équipe" : "participant"}</dt>
                  <dd>{name}</dd>
                </div>
              )}
              <div>
                <dt>édition</dt>
                <dd>
                  {EDITION_LABEL} · {YEAR}
                </dd>
              </div>
              <div>
                <dt>finale</dt>
                <dd>{EVENT_DATE_LABEL}</dd>
              </div>
            </dl>
            <p>
              {`L'organisation reviendra vers ${team ? "le référent de l'équipe" : "vous"} par téléphone ou par e-mail avec les prochaines étapes.`}
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/">
                Retour à l&apos;accueil
              </Link>
              <Link className="button button-outline" href="/conditions">
                Relire le règlement
              </Link>
            </div>
            <p className="receipt-foot">
              Une erreur dans l&apos;inscription ? Appelez le <a href={CONTACT_PHONE_HREF}>{CONTACT_PHONE}</a>.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
