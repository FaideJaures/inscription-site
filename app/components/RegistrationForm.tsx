"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import PhoneField from "./PhoneField";
import RulesBox from "./RulesBox";
import VerificationField from "./VerificationField";
import { LMD_LEVELS, OTHER_SCHOOL, SCHOOLS, YEAR } from "@/app/lib/contest";
import {
  EMPTY_MEMBER,
  EMPTY_PROJECT,
  MAX_MEMBERS,
  DUPLICATE_PHONE,
  MIN_GROUP_MEMBERS,
  validateGroupName,
  validateMember,
  validateProject,
  type Member,
  type MemberErrors,
  type Project,
  type RegistrationType,
} from "@/app/lib/registration";
import { clearDraft, loadDraft, saveDraft } from "@/app/lib/draft";
import { hasPhone, normalizeEmail, normalizePhone, type VerificationChannel } from "@/app/lib/verification";

const MEMBER_FIELDS: (keyof Member)[] = ["prenom", "nom", "sexe", "telephone", "email", "etablissement", "etablissementCustom", "niveau", "specialite"];
const PROJECT_FIELDS: (keyof Project)[] = ["titre", "descriptif", "langages", "autres"];
const DUPLICATE_EMAIL = "Cette adresse est déjà utilisée par un autre membre.";
const proofKey = (channel: VerificationChannel, value: string) =>
  `${channel}:${channel === "email" ? normalizeEmail(value) : normalizePhone(value)}`;

const memberId = (index: number, field: string) => `m${index}-${field}`;
const pad = (n: number) => String(n).padStart(2, "0");
const newMembers = (type: RegistrationType) =>
  Array.from({ length: type === "solo" ? 1 : MIN_GROUP_MEMBERS }, () => ({ ...EMPTY_MEMBER }));

/** Every member's errors, including an e-mail or a number used twice within the same registration. */
function checkMembers(members: Member[]): MemberErrors[] {
  const seen = new Set<string>();
  return members.map((member) => {
    const errors = validateMember(member);
    const email = proofKey("email", member.email);
    if (!errors.email) {
      if (seen.has(email)) errors.email = DUPLICATE_EMAIL;
      seen.add(email);
    }
    const phone = proofKey("phone", member.telephone);
    if (!errors.telephone && hasPhone(member.telephone)) {
      if (seen.has(phone)) errors.telephone = DUPLICATE_PHONE;
      seen.add(phone);
    }
    return errors;
  });
}

/**
 * The whole registration on one page: team, members, project, then the
 * règlement and the send button. Errors appear once a field has been left,
 * or for every field after a send attempt. A sticky bar tracks progress.
 */
export default function RegistrationForm({ type }: { type: RegistrationType }) {
  const router = useRouter();
  const team = type === "groupe";
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<Member[]>(() => newMembers(type));
  const [project, setProject] = useState<Project>({ ...EMPTY_PROJECT });
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [attempted, setAttempted] = useState(false);
  const [rulesRead, setRulesRead] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [verified, setVerified] = useState<Set<string>>(() => new Set());

  // Restore what was typed on this device for this same format.
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.type === type) {
      /* eslint-disable react-hooks/set-state-in-effect -- localStorage is only readable after mount */
      setGroupName(draft.groupName ?? "");
      if (draft.members.length) setMembers(draft.members.map((m) => ({ ...EMPTY_MEMBER, ...m })));
      setProject({ ...EMPTY_PROJECT, ...draft.project });
      setVerified(new Set(draft.verified ?? []));
      setRestored(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    setLoaded(true);
  }, [type]);

  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(
      () => saveDraft({ type, groupName, members, project, step: 0, verified: [...verified] }),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [loaded, type, groupName, members, project, verified]);

  const groupError = validateGroupName(type, groupName);
  const memberErrors = useMemo(() => checkMembers(members), [members]);
  const projectErrors = useMemo(() => validateProject(project), [project]);
  const isVerified = (channel: VerificationChannel, value: string) => verified.has(proofKey(channel, value));
  // Only the e-mail must be proven; verifying a phone number is optional.
  const unverified = (i: number): "email" | null => (isVerified("email", members[i].email) ? null : "email");
  const membersOk =
    memberErrors.every((e) => Object.keys(e).length === 0) && members.every((_, i) => unverified(i) === null);
  const markVerified = useCallback(
    (channel: VerificationChannel) => (target: string) =>
      setVerified((previous) => new Set(previous).add(`${channel}:${target}`)),
    [],
  );
  const projectOk = Object.keys(projectErrors).length === 0;

  const sections = [
    ...(team ? [{ id: "sec-equipe", label: "Équipe", done: !groupError }] : []),
    { id: "sec-membres", label: team ? "Membres" : "Participant", done: membersOk },
    { id: "sec-projet", label: "Projet", done: projectOk },
    { id: "sec-envoi", label: "Règlement", done: accepted },
  ];
  const doneCount = sections.filter((s) => s.done).length;
  const filled = Math.round((doneCount / sections.length) * 10);

  const show = (key: string, message?: string) => (attempted || touched.has(key) ? message : undefined);
  const leave = (key: string) => () =>
    setTouched((previous) => (previous.has(key) ? previous : new Set(previous).add(key)));

  const editMember = (index: number, field: keyof Member, value: string) =>
    setMembers((previous) =>
      previous.map((m, i) => {
        if (i !== index) return m;
        const next = { ...m, [field]: value } as Member;
        if (field === "etablissement" && value !== OTHER_SCHOOL) next.etablissementCustom = "";
        return next;
      }),
    );
  const addMember = () => setMembers((previous) => (previous.length < MAX_MEMBERS ? [...previous, { ...EMPTY_MEMBER }] : previous));
  const removeMember = (index: number) => {
    setMembers((previous) => (previous.length > MIN_GROUP_MEMBERS ? previous.filter((_, i) => i !== index) : previous));
    // Error flags are keyed by position, which just shifted.
    setTouched((previous) => new Set([...previous].filter((key) => !key.startsWith("m"))));
  };

  /** Id of the first field that would block sending, in reading order. */
  const firstProblem = (): string | null => {
    if (groupError) return "groupName";
    for (let i = 0; i < members.length; i++) {
      const field = MEMBER_FIELDS.find((f) => memberErrors[i][f]);
      if (field) return memberId(i, field);
      const pending = unverified(i);
      if (pending) return `${memberId(i, pending)}-verify`;
    }
    const field = PROJECT_FIELDS.find((f) => projectErrors[f]);
    return field ?? null;
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    setSendError(null);
    const problem = firstProblem() ?? (accepted ? null : rulesRead ? "terms" : "rules-box");
    if (problem) {
      const el = document.getElementById(problem);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.focus({ preventScroll: true });
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, groupName, members, project, acceptedTerms: true }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        errors?: { members?: MemberErrors[] };
      };
      if (!response.ok) {
        // A proof that expired on the server: drop its check mark so the field asks again.
        const stale = (payload.errors?.members ?? []).flatMap((e, i) => [
          ...(e?.email && members[i] ? [proofKey("email", members[i].email)] : []),
          ...(e?.telephone && members[i] ? [proofKey("phone", members[i].telephone)] : []),
        ]);
        if (stale.length) setVerified((previous) => new Set([...previous].filter((key) => !stale.includes(key))));
        setSendError(payload.message ?? "L'inscription n'a pas pu être enregistrée. Réessayez dans un instant.");
        return;
      }
      clearDraft();
      const name = team ? groupName.trim() : members[0].prenom.trim();
      router.push(`/inscription/merci?type=${type}&nom=${encodeURIComponent(name)}`);
    } catch {
      setSendError("Connexion impossible. Vérifiez votre réseau : votre saisie est conservée sur cet appareil.");
    } finally {
      setSending(false);
    }
  }

  // Enter in a one-line field shouldn't send a half-filled form.
  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    const tag = (event.target as HTMLElement).tagName;
    if (event.key === "Enter" && tag === "INPUT") event.preventDefault();
  };

  const markRead = useCallback(() => setRulesRead(true), []);
  let number = 0;
  const next = () => pad(++number);

  return (
    <form className="enrol-form" onSubmit={onSubmit} onKeyDown={onKeyDown} noValidate>
      <div className="progress-bar">
        <div className="page-wrap progress-row">
          <p className="progress-text" aria-live="polite">
            <span className="progress-cells" aria-hidden="true">
              [{"█".repeat(filled)}
              {"░".repeat(10 - filled)}]
            </span>{" "}
            {doneCount}/{sections.length} sections complètes
          </p>
          <ol className="progress-links">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} data-complete={s.done || undefined}>
                  {s.done ? "✓" : "○"} {s.label}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="page-wrap enrol-sections">
        {restored && (
          <p className="notice" role="status">
            Nous avons retrouvé votre saisie sur cet appareil : reprenez là où vous vous étiez arrêté.
          </p>
        )}

        {team && (
          <FormSection id="sec-equipe" number={next()} title="Votre équipe" hint="Le nom sous lequel votre équipe sera appelée le jour J.">
            <div className="field">
              <label htmlFor="groupName">Nom du groupe</label>
              <input
                id="groupName"
                value={groupName}
                placeholder="Ex. Les Compilateurs"
                onChange={(e) => setGroupName(e.target.value)}
                onBlur={leave("groupName")}
                aria-invalid={show("groupName", groupError) ? true : undefined}
                aria-describedby="groupName-error"
              />
              <ErrorText id="groupName-error" message={show("groupName", groupError)} />
            </div>
          </FormSection>
        )}

        <FormSection
          id="sec-membres"
          number={next()}
          title={team ? "Les membres" : "Vos informations"}
          hint={
            team
              ? `De ${MIN_GROUP_MEMBERS} à ${MAX_MEMBERS} membres. Le premier est le référent, contacté par l'organisation. Chaque e-mail se vérifie par un code.`
              : "Votre e-mail se vérifie par un code. Le téléphone est facultatif."
          }
        >
          {members.map((member, index) => (
            <fieldset className="member-card" key={index}>
              <legend>{team ? `membre_${pad(index + 1)}${index === 0 ? " · référent" : ""}` : "participant"}</legend>
              {team && members.length > MIN_GROUP_MEMBERS && (
                <button type="button" className="member-remove" onClick={() => removeMember(index)}>
                  retirer ✕
                </button>
              )}
              <MemberFields
                index={index}
                member={member}
                rawErrors={memberErrors[index]}
                isVerified={isVerified}
                onVerified={markVerified}
                errorFor={(field) => show(memberId(index, field), memberErrors[index][field])}
                onEdit={editMember}
                onLeave={(field) => leave(memberId(index, field))}
              />
            </fieldset>
          ))}
          {team && members.length < MAX_MEMBERS && (
            <button type="button" className="button button-outline button-small" onClick={addMember}>
              + Ajouter un membre
            </button>
          )}
        </FormSection>

        <FormSection id="sec-projet" number={next()} title="Votre projet" hint="L'application que vous présenterez au jury. Elle peut être encore en cours de développement.">
          <div className="field">
            <label htmlFor="titre">Titre du projet</label>
            <input
              id="titre"
              value={project.titre}
              placeholder="Ex. Taxi-Gab, l'appli de réservation de taxis"
              onChange={(e) => setProject({ ...project, titre: e.target.value })}
              onBlur={leave("titre")}
              aria-invalid={show("titre", projectErrors.titre) ? true : undefined}
            />
            <ErrorText message={show("titre", projectErrors.titre)} />
          </div>
          <div className="field">
            <label htmlFor="descriptif">Description</label>
            <textarea
              id="descriptif"
              rows={5}
              value={project.descriptif}
              placeholder="Le problème que votre application résout, pour qui, et comment."
              onChange={(e) => setProject({ ...project, descriptif: e.target.value })}
              onBlur={leave("descriptif")}
              aria-invalid={show("descriptif", projectErrors.descriptif) ? true : undefined}
            />
            <ErrorText message={show("descriptif", projectErrors.descriptif)} />
          </div>
          <div className="field">
            <label htmlFor="langages">Langages et technologies</label>
            <input
              id="langages"
              value={project.langages}
              placeholder="Ex. TypeScript, React Native, Firebase"
              onChange={(e) => setProject({ ...project, langages: e.target.value })}
              onBlur={leave("langages")}
              aria-invalid={show("langages", projectErrors.langages) ? true : undefined}
            />
            <ErrorText message={show("langages", projectErrors.langages)} />
          </div>
          <div className="field">
            <label htmlFor="autres">
              Autres informations <span className="optional">facultatif</span>
            </label>
            <textarea
              id="autres"
              rows={3}
              value={project.autres}
              placeholder="Lien vers une démo, un dépôt, l'état d'avancement…"
              onChange={(e) => setProject({ ...project, autres: e.target.value })}
            />
            <ErrorText message={projectErrors.autres} />
          </div>
        </FormSection>

        <FormSection
          id="sec-envoi"
          number={next()}
          title="Règlement et envoi"
          hint="Lisez le règlement jusqu'au bout : la case d'acceptation se débloque à la fin."
        >
          <RulesBox onRead={markRead} />
          <label className="check-line" htmlFor="terms">
            <input
              id="terms"
              type="checkbox"
              checked={accepted}
              disabled={!rulesRead}
              onChange={(e) => setAccepted(e.target.checked)}
              aria-invalid={attempted && !accepted ? true : undefined}
            />
            <span>
              J&apos;ai lu et j&apos;accepte le règlement du concours, et je m&apos;engage à présenter une application conçue
              par {team ? "mon équipe" : "moi-même"}.
            </span>
          </label>
          {attempted && !accepted && (
            <p className="error-text">
              {rulesRead ? "Cochez la case pour accepter le règlement." : "Faites défiler le règlement jusqu'à la fin, puis acceptez-le."}
            </p>
          )}

          {sendError && (
            <p className="send-error" role="alert">
              {sendError}
            </p>
          )}

          <button className="button button-primary button-wide" type="submit" disabled={sending}>
            {sending ? "Envoi de l'inscription…" : `Envoyer mon inscription ${YEAR}`}
          </button>
          <p className="legal-note">
            Vos informations servent uniquement à l&apos;organisation du concours. Voir le <Link href="/conditions">règlement</Link>.
          </p>
        </FormSection>
      </div>
    </form>
  );
}

function FormSection({ id, number, title, hint, children }: { id: string; number: string; title: string; hint: string; children: ReactNode }) {
  return (
    <section className="form-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="form-section-side">
        <p className="form-section-num">{number}</p>
        <h2 id={`${id}-title`}>{title}</h2>
        <p className="form-section-hint">{hint}</p>
      </div>
      <div className="form-section-body">{children}</div>
    </section>
  );
}

function MemberFields({
  index,
  member,
  rawErrors,
  isVerified,
  onVerified,
  errorFor,
  onEdit,
  onLeave,
}: {
  index: number;
  member: Member;
  /** Errors regardless of touched state: a field is verifiable once it has none. */
  rawErrors: MemberErrors;
  isVerified: (channel: VerificationChannel, value: string) => boolean;
  onVerified: (channel: VerificationChannel) => (target: string) => void;
  errorFor: (field: keyof Member) => string | undefined;
  onEdit: (index: number, field: keyof Member, value: string) => void;
  onLeave: (field: keyof Member) => () => void;
}) {
  const own = index === 0; // browsers may autofill the first member only
  const input = (field: keyof Member) => {
    const error = errorFor(field);
    return {
      id: memberId(index, field),
      value: member[field],
      onChange: (e: { target: { value: string } }) => onEdit(index, field, e.target.value),
      onBlur: onLeave(field),
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${memberId(index, field)}-error` : undefined,
    };
  };
  const error = (field: keyof Member) => <ErrorText id={`${memberId(index, field)}-error`} message={errorFor(field)} />;

  return (
    <>
      <div className="field-pair">
        <div className="field">
          <label htmlFor={memberId(index, "prenom")}>Prénom</label>
          <input autoComplete={own ? "given-name" : "off"} {...input("prenom")} />
          {error("prenom")}
        </div>
        <div className="field">
          <label htmlFor={memberId(index, "nom")}>Nom</label>
          <input autoComplete={own ? "family-name" : "off"} {...input("nom")} />
          {error("nom")}
        </div>
      </div>

      <div className="field">
        <span className="field-label" id={memberId(index, "sexe-label")}>
          Sexe
        </span>
        <div className="pills" role="radiogroup" aria-labelledby={memberId(index, "sexe-label")}>
          {[
            ["M", "Masculin"],
            ["F", "Féminin"],
          ].map(([value, label]) => (
            <label key={value} className="pill" data-checked={member.sexe === value || undefined}>
              <input
                type="radio"
                name={memberId(index, "sexe")}
                id={value === "M" ? memberId(index, "sexe") : undefined}
                value={value}
                checked={member.sexe === value}
                onChange={() => onEdit(index, "sexe", value)}
              />
              {label}
            </label>
          ))}
        </div>
        {error("sexe")}
      </div>

      <div className="field-pair">
        <div className="field">
          <label htmlFor={memberId(index, "telephone")}>Téléphone (WhatsApp, facultatif)</label>
          <PhoneField
            id={memberId(index, "telephone")}
            value={member.telephone}
            onChange={(value) => onEdit(index, "telephone", value)}
            onBlur={onLeave("telephone")}
            autoComplete={own ? "tel" : "off"}
            invalid={Boolean(errorFor("telephone"))}
            describedBy={errorFor("telephone") ? `${memberId(index, "telephone")}-error` : undefined}
          />
          {error("telephone")}
          {hasPhone(member.telephone) && (
            <VerificationField
              id={`${memberId(index, "telephone")}-verify`}
              channel="phone"
              target={normalizePhone(member.telephone)}
              ready={!rawErrors.telephone}
              verified={isVerified("phone", member.telephone)}
              onVerified={onVerified("phone")}
            />
          )}
        </div>
        <div className="field">
          <label htmlFor={memberId(index, "email")}>E-mail</label>
          <input type="email" inputMode="email" autoComplete={own ? "email" : "off"} placeholder="prenom.nom@exemple.com" {...input("email")} />
          {error("email")}
          <VerificationField
            id={`${memberId(index, "email")}-verify`}
            channel="email"
            target={normalizeEmail(member.email)}
            ready={!rawErrors.email}
            verified={isVerified("email", member.email)}
            onVerified={onVerified("email")}
          />
        </div>
      </div>

      <div className="field-pair">
        <div className="field">
          <label htmlFor={memberId(index, "etablissement")}>Établissement</label>
          <select {...input("etablissement")}>
            <option value="">Sélectionner…</option>
            {SCHOOLS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.name}
              </option>
            ))}
            <option value={OTHER_SCHOOL}>Autre établissement</option>
          </select>
          {error("etablissement")}
        </div>
        <div className="field">
          <label htmlFor={memberId(index, "niveau")}>Niveau d&apos;études</label>
          <select {...input("niveau")}>
            <option value="">Sélectionner…</option>
            {LMD_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          {error("niveau")}
        </div>
      </div>

      {member.etablissement === OTHER_SCHOOL && (
        <div className="field">
          <label htmlFor={memberId(index, "etablissementCustom")}>Nom de l&apos;établissement</label>
          <input {...input("etablissementCustom")} />
          {error("etablissementCustom")}
        </div>
      )}

      <div className="field">
        <label htmlFor={memberId(index, "specialite")}>Spécialité</label>
        <input placeholder="Ex. Génie logiciel, Réseaux, Data…" {...input("specialite")} />
        {error("specialite")}
      </div>
    </>
  );
}

function ErrorText({ id, message }: { id?: string; message?: string }) {
  return message ? (
    <p className="error-text" id={id}>
      {message}
    </p>
  ) : null;
}
