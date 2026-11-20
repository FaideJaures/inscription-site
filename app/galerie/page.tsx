import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import SectionHeading from "../components/SectionHeading";
import { PhotoButton, type Photo } from "../components/PhotoViewer";
import { EDITION, PAST_EDITIONS, REGISTRATION_OPEN, YEAR, editionPhotos } from "../lib/contest";

export const metadata: Metadata = {
  title: "Éditions passées",
  description: "Les photos des précédentes éditions du MBAYA CODE CONTEST.",
};

// Varying crops so the columns don't line up into a plain grid.
const SHAPES = ["4 / 3", "3 / 4", "1 / 1", "4 / 3", "16 / 10", "3 / 4"];

export default function GaleriePage() {
  const editions = PAST_EDITIONS.map((edition) => ({
    ...edition,
    anchor: `edition-${edition.edition}`,
    photos: editionPhotos(edition.folder, edition.count).map<Photo>((src, i) => ({
      src,
      alt: `${edition.label}, photo ${i + 1}`,
      title: edition.label,
      note: `Photo ${i + 1} sur ${edition.count}`,
      width: edition.width,
      height: edition.height,
    })),
  }));

  return (
    <main id="top">
      <section className="page-intro page-wrap">
        <SectionHeading
          level={1}
          label="galerie"
          title={`${EDITION - 1} éditions avant ${YEAR}.`}
          lead="Photos des présentations des éditions précédentes, classées par édition."
          action={
            REGISTRATION_OPEN ? (
              <Link className="button button-primary" href="/inscription">
                Participer en {YEAR}
              </Link>
            ) : undefined
          }
        />
      </section>

      <nav className="gallery-tabs" aria-label="Éditions">
        <div className="page-wrap">
          {editions.map((e) => (
            <a key={e.anchor} href={`#${e.anchor}`}>
              edition_{e.edition}/<span className="tab-count">{e.count}</span>
            </a>
          ))}
        </div>
      </nav>

      {editions.map((edition) => (
        <section className="zone page-wrap gallery-zone" id={edition.anchor} key={edition.anchor} aria-labelledby={`${edition.anchor}-title`}>
          <SectionHeading id={`${edition.anchor}-title`} label={`edition_${edition.edition} — ${edition.count} photos`} title={edition.label} />
          <ul className="masonry">
            {edition.photos.map((photo, i) => (
              <li key={photo.src} style={{ aspectRatio: SHAPES[i % SHAPES.length] }}>
                <PhotoButton photos={edition.photos} at={i} className="masonry-tile" label={`Agrandir : ${photo.alt}`}>
                  <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 380px" />
                </PhotoButton>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Footer />
    </main>
  );
}
