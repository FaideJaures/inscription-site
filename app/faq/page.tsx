import type { Metadata } from "next";
import Link from "next/link";
import Accordion from "../components/Accordion";
import Footer from "../components/Footer";
import SectionHeading from "../components/SectionHeading";
import { FAQ } from "../lib/faq";
import { CONTACT_PHONE, CONTACT_PHONE_HREF } from "../lib/contest";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Qui peut participer, en équipe ou seul, à qui appartient le projet : les réponses sur le MBAYA CODE CONTEST.",
};

export default function FaqPage() {
  return (
    <main id="top">
      <section className="page-intro page-wrap">
        <SectionHeading
          level={1}
          label="faq"
          title="Questions fréquentes"
          lead="Chaque réponse cite l'article du règlement correspondant."
        />
      </section>

      <section className="zone zone-tight page-wrap faq-layout">
        <Accordion items={FAQ} />
        <aside className="ask-box">
          <p className="sec-label">{"// une autre question ?"}</p>
          <p>L&apos;organisation répond par téléphone.</p>
          <a className="ask-phone" href={CONTACT_PHONE_HREF}>
            {CONTACT_PHONE}
          </a>
          <Link className="arrow-link" href="/conditions">
            Lire le règlement complet →
          </Link>
        </aside>
      </section>

      <Footer />
    </main>
  );
}
