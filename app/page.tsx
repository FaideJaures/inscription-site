import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import Accordion from "./components/Accordion";
import ArticlesModal, { RedirectIcon } from "./components/ArticlesModal";
import ContestMark from "./components/ContestMark";
import EditionMosaic from "./components/EditionMosaic";
import Footer from "./components/Footer";
import SectionHeading from "./components/SectionHeading";
import TerminalStats from "./components/TerminalStats";
import {
  CONTEST_NAME,
  EDITION,
  EDITION_LABEL,
  EVENT_DATE,
  EVENT_DATE_LABEL,
  PARTNERS,
  REGISTRATION_OPEN,
  SCHOOLS,
  YEAR,
} from "./lib/contest";
import { FAQ_TEASER } from "./lib/faq";

/** The contest in four "files". `projet.md` is the tall one in the bento grid. */
const FILES = [
  {
    file: "projet.md",
    colour: "var(--vert)",
    title: "Vous présentez une application que vous avez conçue",
    text: "C'est l'engagement sur l'honneur qui ouvre le règlement. Aucun candidat ne reprend l'idée d'un autre sans son accord.",
    code: "// engagement sur l'honneur\nconst app = await equipe.construire();\njury.presenter(app);",
  },
  {
    file: "format.md",
    colour: "var(--bleu)",
    title: "Seul, ou en équipe de deux membres et plus",
    text: "En équipe, le premier inscrit est le référent : un seul interlocuteur pour l'organisation.",
  },
  {
    file: "propriete.md",
    colour: "var(--jaune)",
    title: "Votre projet reste le vôtre",
    text: "Le club ne revendique jamais la paternité d'un projet. S'il le vend avec votre accord, 80 % du revenu vous revient.",
  },
  {
    file: "recompenses.md",
    colour: "var(--rouge)",
    title: "Un ou plusieurs prix, par catégorie et par mérite",
    text: "Leur nature peut être annoncée avant le concours, ou gardée secrète jusqu'au jour J.",
    link: true,
  },
];

type Source = { label: string; href: string } | { label: string; articles: number[] };

const STAGES: { claim: string; detail: string; source: Source }[] = [
  {
    claim: "Inscription en ligne",
    detail: "Seul ou en équipe, vous décrivez les participants et le projet que vous présenterez.",
    source: { label: "formulaire d'inscription", href: "/inscription" },
  },
  {
    claim: "Vous terminez votre application",
    detail: "Le projet présenté doit être le vôtre. Un projet inachevé doit être mené à terme avant sa mise sur le marché.",
    source: { label: "règlement · art. 11 et 13", articles: [11, 13] },
  },
  {
    claim: "Présentation devant le jury",
    detail: "Le comité fixe l'ordre de passage et la durée de chaque présentation ; le jury, ses critères.",
    source: { label: "règlement · art. 1 à 3", articles: [1, 2, 3] },
  },
  {
    claim: "Prix et mise sur le marché",
    detail: "Un ou plusieurs prix par catégorie. Avec votre accord, le CPE peut vendre votre application : 80 % vous reviennent.",
    source: { label: "règlement · art. 1, 4 et 9", articles: [1, 4, 9] },
  },
];

export default function Home() {
  return (
    <main id="top">
      <section className="hero page-wrap">
        <div className="hero-copy">
          <p className="hero-badge">
            <ContestMark className="hero-badge-mark" />
            <span>
              {EDITION_LABEL} · {YEAR}
            </span>
          </p>
          <h1>
            Le concours où l&apos;on présente ce qu&apos;on a <span className="highlight">vraiment codé</span>.
          </h1>
          <p className="hero-lead">
            {CONTEST_NAME}, {EDITION_LABEL}. Seul ou en équipe, vous présentez votre application devant un jury.
          </p>
          <div className="button-row">
            {REGISTRATION_OPEN ? (
              <Link className="button button-primary" href="/inscription">
                S&apos;inscrire maintenant
              </Link>
            ) : (
              <span className="button button-outline" aria-disabled="true">
                Inscriptions closes
              </span>
            )}
            <Link className="button button-outline" href="/conditions">
              Lire le règlement
            </Link>
          </div>
          <ul className="hero-tags">
            <li>solo | équipe</li>
            <li>date: {EVENT_DATE ? EVENT_DATE_LABEL : "à annoncer"}</li>
            <li>niveaux: L1 → D3</li>
            <li>{EDITION - 1} éditions passées</li>
          </ul>
        </div>
        <TerminalStats />
      </section>

      <section className="zone page-wrap" id="concours" aria-labelledby="concours-title">
        <SectionHeading
          id="concours-title"
          label="01 — le concours"
          title="Le concours"
          lead="Organisé par le club de programmation de l'école (CPE). Objectif : mettre les projets étudiants sur le marché."
        />
        <div className="bento">
          {FILES.map((f) => (
            <article className="file-card" key={f.file} style={{ "--tab": f.colour } as CSSProperties}>
              <p className="file-tab">{f.file}</p>
              <div className="file-body">
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                {f.code && <pre className="file-code">{f.code}</pre>}
                {f.link && (
                  <Link className="arrow-link" href="/conditions">
                    Lire les 13 articles du règlement →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="zone page-wrap" id="deroulement" aria-labelledby="deroulement-title">
        <SectionHeading
          id="deroulement-title"
          label="02 — déroulement"
          title="Déroulement"
          lead={`Présentation finale : ${EVENT_DATE_LABEL.toLowerCase()}.`}
        />
        <ol className="timeline">
          {STAGES.map((stage, i) => (
            <li className="timeline-item" key={stage.claim}>
              <span className="timeline-node">{String(i + 1).padStart(2, "0")}</span>
              <h3>{stage.claim}</h3>
              <p>{stage.detail}</p>
              <p className="timeline-ref">
                {"href" in stage.source ? (
                  <Link href={stage.source.href}>
                    {stage.source.label}
                    <RedirectIcon />
                  </Link>
                ) : (
                  <ArticlesModal label={stage.source.label} articles={stage.source.articles} />
                )}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="zone page-wrap" id="editions" aria-labelledby="editions-title">
        <SectionHeading
          id="editions-title"
          label="03 — éditions passées"
          title="Éditions précédentes"
          lead={`${EDITION - 1} éditions avant celle-ci.`}
          action={
            <Link className="button button-outline" href="/galerie">
              Toute la galerie
            </Link>
          }
        />
        <EditionMosaic />
      </section>

      <section className="zone page-wrap" id="partenaires" aria-labelledby="partenaires-title">
        <SectionHeading id="partenaires-title" label="04 — ils rendent l'édition possible" title="Partenaires et écoles" />
        <div className="board">
          <div className="board-row">
            <p className="board-label">partenaires/</p>
            <ul className="board-logos board-logos-large">
              {PARTNERS.map((p) => (
                <li key={p.name}>
                  <Image src={p.src} alt={p.name} width={p.width} height={p.height} sizes="200px" />
                  <span>{p.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="board-row">
            <p className="board-label">écoles/</p>
            <ul className="board-logos">
              {SCHOOLS.map((s) => (
                <li key={s.value}>
                  <Image src={s.src} alt={s.name} width={s.width} height={s.height} sizes="120px" />
                  <span>{s.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="board-foot">+ tout autre établissement : choisissez « Autre établissement » dans le formulaire.</p>
        </div>
      </section>

      <section className="zone page-wrap split" id="questions" aria-labelledby="questions-title">
        <div>
          <SectionHeading id="questions-title" label="05 — questions" title="Questions fréquentes" />
          <Link className="arrow-link" href="/faq">
            Toutes les questions →
          </Link>
        </div>
        <Accordion items={FAQ_TEASER} />
      </section>

      {REGISTRATION_OPEN && (
        <section className="page-wrap cta" aria-labelledby="cta-title">
          <div className="cta-box">
            <div className="flag-stripe" aria-hidden="true" />
            <p className="cta-cmd">
              <span className="terminal-prompt">$</span> mbaya register --edition {YEAR}
              <span className="terminal-cursor" aria-hidden="true" />
            </p>
            <div className="cta-row">
              <h2 id="cta-title">Inscriptions {YEAR} ouvertes</h2>
              <Link className="button button-primary" href="/inscription">
                S&apos;inscrire maintenant
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
