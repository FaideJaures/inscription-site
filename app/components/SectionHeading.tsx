import type { ReactNode } from "react";

/**
 * Section title with a code-comment label above it: `// 02 — déroulement`.
 * `level` picks h1 for page intros, h2 for sections inside a page.
 */
export default function SectionHeading({
  id,
  label,
  title,
  lead,
  action,
  level = 2,
}: {
  id?: string;
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  level?: 1 | 2;
}) {
  const Title = level === 1 ? "h1" : "h2";
  return (
    <header className="sec-head">
      <p className="sec-label">{`// ${label}`}</p>
      <div className="sec-head-row">
        <Title id={id}>{title}</Title>
        {action}
      </div>
      {lead && <p className="sec-lead">{lead}</p>}
    </header>
  );
}
