import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import SiteHeader from "./components/SiteHeader";
import { PhotoViewerProvider } from "./components/PhotoViewer";
import { THEME_SCRIPT, ThemeProvider } from "./lib/theme";
import { CONTEST_NAME, EDITION_LABEL, YEAR } from "./lib/contest";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/buttons.css";
import "./styles/header.css";
import "./styles/home.css";
import "./styles/form.css";
import "./styles/gallery.css";
import "./styles/rules.css";
import "./styles/admin.css";
import "./styles/footer.css";

const bodyFont = IBM_Plex_Sans({ variable: "--ff-body", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const titleFont = Space_Grotesk({ variable: "--ff-title", subsets: ["latin"], display: "swap" });
const codeFont = JetBrains_Mono({ variable: "--ff-code", subsets: ["latin"], display: "swap" });
// Only for the logo: its width axis draws the condensed "MBAYA".
const markFont = Bricolage_Grotesque({ variable: "--ff-mark", subsets: ["latin"], display: "swap", axes: ["wdth"] });

const DESCRIPTION = `${CONTEST_NAME} ${YEAR}, ${EDITION_LABEL} : le concours de programmation où les étudiants présentent l'application qu'ils ont construite, seuls ou en équipe. Inscriptions en ligne.`;

export const metadata: Metadata = {
  title: {
    default: `${CONTEST_NAME} ${YEAR} — ${EDITION_LABEL}`,
    template: `%s — ${CONTEST_NAME} ${YEAR}`,
  },
  description: DESCRIPTION,
  applicationName: CONTEST_NAME,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: CONTEST_NAME,
    title: `${CONTEST_NAME} ${YEAR} — ${EDITION_LABEL}`,
    description: DESCRIPTION,
  },
  icons: { icon: "/icon.svg" },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070a12" },
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
  ],
};

const fontVariables = [bodyFont, titleFont, codeFont, markFont].map((font) => font.variable).join(" ");

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-theme="light" suppressHydrationWarning>
      <body className={fontVariables}>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <a className="skip-to-content" href="#top">
          Aller au contenu
        </a>
        <ThemeProvider>
          <SiteHeader />
          <PhotoViewerProvider>{children}</PhotoViewerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
