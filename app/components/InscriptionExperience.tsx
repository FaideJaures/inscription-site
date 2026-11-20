"use client";

import { useEffect, useState } from "react";
import RegistrationForm from "./RegistrationForm";
import SectionHeading from "./SectionHeading";
import { clearDraft, draftHasContent, loadDraft } from "@/app/lib/draft";
import { CONTACT_PHONE, CONTACT_PHONE_HREF, EDITION_LABEL, EVENT_DATE_LABEL, YEAR } from "@/app/lib/contest";
import type { RegistrationType } from "@/app/lib/registration";

const FORMATS: { value: RegistrationType; flag: string; name: string; text: string }[] = [
  { value: "solo", flag: "--solo", name: "Je participe seul", text: "Une personne, un projet." },
  { value: "groupe", flag: "--equipe", name: "Nous participons en équipe", text: "2 à 10 membres, un référent, un projet commun." },
];

export default function InscriptionExperience() {
  const [type, setType] = useState<RegistrationType | null>(null);

  // A started draft in this browser means the visitor had already picked a format.
  useEffect(() => {
    const draft = loadDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    if (draft && draftHasContent(draft)) setType(draft.type);
  }, []);

  const pick = (next: RegistrationType) => {
    if (next === type) return;
    if (type && draftHasContent(loadDraft())) {
      const ok = window.confirm("Vous avez commencé à remplir le formulaire. Changer de formule effacera votre saisie. Continuer ?");
      if (!ok) return;
    }
    if (type) clearDraft();
    setType(next);
  };

  return (
    <main id="top" className="enrol-page">
      <section className="page-intro page-wrap">
        <SectionHeading
          level={1}
          label={`inscription — ${EDITION_LABEL}`}
          title={`Inscription ${YEAR}`}
          lead={
            <>
              Présentation finale : {EVENT_DATE_LABEL.toLowerCase()}. Contact :{" "}
              <a href={CONTACT_PHONE_HREF}>{CONTACT_PHONE}</a>
            </>
          }
        />
        <div className="format-switch" role="radiogroup" aria-label="Formule d'inscription">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={type === f.value}
              className="format-option"
              onClick={() => pick(f.value)}
            >
              <span className="format-flag">{f.flag}</span>
              <span className="format-name">{f.name}</span>
              <span className="format-text">{f.text}</span>
            </button>
          ))}
        </div>
      </section>

      {type ? (
        <RegistrationForm key={type} type={type} />
      ) : (
        <p className="page-wrap format-hint">↑ Choisissez une formule pour afficher le formulaire.</p>
      )}
    </main>
  );
}
