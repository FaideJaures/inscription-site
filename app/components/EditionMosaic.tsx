"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PhotoButton, type Photo } from "./PhotoViewer";
import { PAST_EDITIONS, editionPhotos } from "@/app/lib/contest";

const SHOWN = 8; // one large tile + seven small ones, then the "more" tile

const albums = PAST_EDITIONS.map((edition) => ({
  ...edition,
  photos: editionPhotos(edition.folder, edition.count).map<Photo>((src, i) => ({
    src,
    alt: `${edition.label}, photo ${i + 1}`,
    title: edition.label,
    note: `Photo ${i + 1} sur ${edition.count}`,
    width: edition.width,
    height: edition.height,
  })),
}));

/** Tabs per past edition, each showing a photo mosaic that opens in the viewer. */
export default function EditionMosaic() {
  const [current, setCurrent] = useState(0);
  const album = albums[current];

  return (
    <div className="mosaic-block">
      <div className="tabs" role="tablist" aria-label="Édition">
        {albums.map((a, i) => (
          <button
            key={a.edition}
            type="button"
            role="tab"
            id={`mosaic-tab-${a.edition}`}
            className="tab"
            aria-selected={i === current}
            aria-controls="mosaic-panel"
            onClick={() => setCurrent(i)}
          >
            edition_{a.edition}/<span className="tab-count">{a.count} photos</span>
          </button>
        ))}
      </div>

      <div className="mosaic" id="mosaic-panel" role="tabpanel" aria-labelledby={`mosaic-tab-${album.edition}`}>
        {album.photos.slice(0, SHOWN).map((photo, i) => (
          <PhotoButton key={photo.src} photos={album.photos} at={i} className="mosaic-tile" label={`Agrandir : ${photo.alt}`}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes={i === 0 ? "(max-width: 760px) 100vw, 580px" : "(max-width: 760px) 50vw, 290px"}
            />
          </PhotoButton>
        ))}
        <Link className="mosaic-tile mosaic-more" href={`/galerie#edition-${album.edition}`}>
          <span className="mosaic-more-count">+{album.count - SHOWN}</span>
          <span>photos → galerie</span>
        </Link>
      </div>
    </div>
  );
}
