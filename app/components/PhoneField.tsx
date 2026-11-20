"use client";

import { DIAL_CODES, splitPhone } from "@/app/lib/verification";

const OTHER = "other";

/**
 * Dial code + national number, stored as one "+241…" string. "Autre" lets
 * the visitor type a full international number themselves.
 */
export default function PhoneField({
  id,
  value,
  onChange,
  onBlur,
  autoComplete,
  invalid,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  autoComplete: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const { dial, national } = splitPhone(value);
  const select = dial || OTHER;

  return (
    <div className="phone-field">
      <select
        aria-label="Indicatif"
        value={select}
        onChange={(e) => {
          const next = e.target.value;
          const digits = national.replace(/^\+\d*/, "");
          onChange(next === OTHER ? `+${digits}` : `${next}${digits}`);
        }}
      >
        {DIAL_CODES.map((d) => (
          <option key={d.code} value={d.code}>
            {d.label}
          </option>
        ))}
        <option value={OTHER}>Autre</option>
      </select>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        placeholder={select === OTHER ? "+XXX …" : "0X XX XX XX"}
        value={national}
        onChange={(e) => onChange(select === OTHER ? e.target.value : `${dial}${e.target.value}`)}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      />
    </div>
  );
}
