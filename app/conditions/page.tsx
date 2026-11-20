import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/Footer";
import Reglement from "../components/Reglement";
import RulesIndex from "../components/RulesIndex";
import SectionHeading from "../components/SectionHeading";
import { PhotoButton } from "../components/PhotoViewer";
import { REGISTRATION_OPEN } from "../lib/contest";

export const metadata: Metadata = {
  title: "Règlement",
  description: "Les 13 articles du règlement du MBAYA CODE CONTEST, acceptés par chaque candidat à l'inscription.",
};

const ORIGINAL = [
  {
    src: "/conditions/condition.jpg",
    alt: "Règlement du concours, document original",
    width: 484,
    height: 693,
    title: "Règlement — document original",
  },
];

export default function ConditionsPage() {
  return (
    <main id="top">
      <section className="page-intro page-wrap">
        <SectionHeading
          level={1}
          label="règlement"
          title="Règlement du concours"
          lead="13 articles, acceptés par chaque candidat à l'inscription. Texte identique au document original."
        />
        <div className="button-row">
          {REGISTRATION_OPEN && (
            <Link className="button button-primary" href="/inscription">
              S&apos;inscrire
            </Link>
          )}
          <PhotoButton className="button button-outline" label="Voir le document original" photos={ORIGINAL}>
            Voir le document original
          </PhotoButton>
        </div>
      </section>

      <div className="rules-layout page-wrap">
        <RulesIndex />
        <Reglement />
      </div>

      <Footer />
    </main>
  );
}
