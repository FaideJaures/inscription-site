import { YEAR } from "@/app/lib/contest";

/**
 * The hexagon badge, redrawn as SVG.
 *
 * The original logo.png is black on a white plate with "2025" baked in: it
 * disappears on the dark canvas and dates itself. Drawn in currentColor, the
 * mark follows the theme and carries whichever year the config says.
 */
export default function ContestMark({
  className,
  year = YEAR,
  title,
}: {
  className?: string;
  year?: number;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 460"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <polygon
        points="248,12 588,128 588,332 248,448 12,350 12,110"
        fill="none"
        stroke="currentColor"
        strokeWidth="18"
        strokeLinejoin="miter"
      />
      <text
        x="300"
        y="214"
        textAnchor="middle"
        fill="currentColor"
        className="contest-mark-word"
        fontSize="148"
        textLength="420"
        lengthAdjust="spacingAndGlyphs"
      >
        MBAYA
      </text>
      <text
        x="300"
        y="252"
        textAnchor="middle"
        className="contest-mark-year"
        fontSize="34"
      >
        {year}
      </text>
      <rect x="78" y="262" width="444" height="9" fill="currentColor" />
      <text
        x="300"
        y="340"
        textAnchor="middle"
        fill="currentColor"
        className="contest-mark-sub"
        fontSize="58"
        textLength="452"
        lengthAdjust="spacingAndGlyphs"
      >
        {"<CODE/> CONTEST"}
      </text>
    </svg>
  );
}
