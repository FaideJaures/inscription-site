"use client";

import { useEffect, useRef, useState } from "react";
import {
  CODE_LENGTH,
  RESEND_COOLDOWN_S,
  VERIFICATION_MESSAGES,
  type VerificationChannel,
  type VerificationErrorCode,
} from "@/app/lib/verification";

type Phase = "idle" | "sending" | "codeSent" | "confirming";

/**
 * The "verify" line under an e-mail or phone input: send a code, type it,
 * done. `target` is the normalised value; when it changes, a pending code no
 * longer applies and the line falls back to idle (compared at render time).
 */
export default function VerificationField({
  id,
  channel,
  target,
  ready,
  verified,
  onVerified,
}: {
  /** Id of the button, so the form can scroll to an unverified field. */
  id: string;
  channel: VerificationChannel;
  target: string;
  /** The value is complete and valid: the button is enabled. */
  ready: boolean;
  verified: boolean;
  onVerified: (target: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<number | null>(null);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<number | null>(null);
  const codeInput = useRef<HTMLInputElement>(null);

  const current: Phase = sentTo !== null && sentTo !== target ? "idle" : phase;
  const what = channel === "email" ? "e-mail" : "WhatsApp";

  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  function showSpamToast() {
    setToast(true);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(false), 8000);
  }

  const spamToast = toast && (
    <div className="toast" role="status">
      <span>Le code peut arriver dans les spams ou les courriers indésirables.</span>
      <button type="button" className="toast-close" aria-label="Fermer" onClick={() => setToast(false)}>
        ×
      </button>
    </div>
  );

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_S);
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setCooldown((s) => {
        if (s <= 1 && timer.current) window.clearInterval(timer.current);
        return Math.max(0, s - 1);
      });
    }, 1000);
  }

  const messageFor = (body: { code?: VerificationErrorCode; message?: string }) =>
    (body.code && VERIFICATION_MESSAGES[body.code]) || body.message || "Une erreur est survenue. Réessayez.";

  async function send() {
    setError(null);
    setSentTo(target);
    setPhase("sending");
    try {
      const response = await fetch("/api/verification/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, value: target }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(messageFor(body));
        setPhase("idle");
        return;
      }
      setCode("");
      setPhase("codeSent");
      startCooldown();
      if (channel === "email") showSpamToast();
      window.setTimeout(() => codeInput.current?.focus(), 0);
    } catch {
      setError("Connexion impossible. Réessayez.");
      setPhase("idle");
    }
  }

  async function confirm(value = code) {
    if (value.length !== CODE_LENGTH) return;
    setError(null);
    setPhase("confirming");
    try {
      const response = await fetch("/api/verification/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, value: target, code: value }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(messageFor(body));
        setPhase("codeSent");
        return;
      }
      setPhase("idle");
      setSentTo(null);
      onVerified(target);
    } catch {
      setError("Connexion impossible. Réessayez.");
      setPhase("codeSent");
    }
  }

  if (verified) {
    return (
      <>
        <p className="verify-line" data-state="verified">
          ✓ {channel === "email" ? "adresse vérifiée" : "numéro vérifié"}
        </p>
        {spamToast}
      </>
    );
  }

  if (current === "codeSent" || current === "confirming") {
    return (
      <div className="verify-line" data-state="pending">
        <p className="verify-hint">Code envoyé par {what}, valable 10 min.</p>
        <div className="verify-code-row">
          <input
            ref={codeInput}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="verify-code"
            placeholder="______"
            maxLength={CODE_LENGTH}
            value={code}
            aria-label={`Code reçu par ${what}`}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
              setCode(next);
              if (next.length === CODE_LENGTH) confirm(next);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirm();
              }
            }}
          />
          <button
            type="button"
            className="button button-outline button-small"
            onClick={() => confirm()}
            disabled={current === "confirming" || code.length !== CODE_LENGTH}
          >
            {current === "confirming" ? "Vérification…" : "Valider"}
          </button>
          <button type="button" className="verify-resend" onClick={send} disabled={cooldown > 0 || current === "confirming"}>
            {cooldown > 0 ? `renvoyer (${cooldown} s)` : "renvoyer"}
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
        {spamToast}
      </div>
    );
  }

  return (
    <div className="verify-line" data-state="idle">
      <button id={id} type="button" className="verify-send" onClick={send} disabled={!ready || current === "sending"}>
        {current === "sending" ? "envoi du code…" : `→ vérifier par ${what}`}
      </button>
      {error && <p className="error-text">{error}</p>}
      {spamToast}
    </div>
  );
}
