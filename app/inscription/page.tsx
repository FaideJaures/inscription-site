import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/Footer";
import InscriptionExperience from "../components/InscriptionExperience";
import SectionHeading from "../components/SectionHeading";
import { CONTACT_PHONE, CONTACT_PHONE_HREF, REGISTRATION_OPEN, YEAR } from "../lib/contest";

export const metadata: Metadata = {
  title: "Inscription",
  description: `Inscrivez-vous, seul ou en équipe, à l'édition ${YEAR} du MBAYA CODE CONTEST.`,
};

export default function InscriptionPage() {
  if (REGISTRATION_OPEN) return <InscriptionExperience />;
  return (
    <main id="top">
      <section className="page-intro page-wrap">
        <SectionHeading
          level={1}
          label={`inscription — édition ${YEAR}`}
          title="Les inscriptions sont closes."
          lead={
            <>
              Pour toute question, appelez le{" "}
              <a href={CONTACT_PHONE_HREF}>{CONTACT_PHONE}</a>.
            </>
          }
        />
        <div className="button-row">
          <Link className="button button-outline" href="/">
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
