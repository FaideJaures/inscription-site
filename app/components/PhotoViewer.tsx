"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  note?: string;
};

type Album = { photos: Photo[]; at: number };
type Show = (photos: Photo[], at?: number) => void;

const ViewerContext = createContext<Show>(() => {});
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Full-screen photo viewer for the whole site. A strip of thumbnails along
 * the bottom jumps to any photo of the album; ← and → page through it and
 * Escape closes it.
 */
export function PhotoViewerProvider({ children }: { children: ReactNode }) {
  const [album, setAlbum] = useState<Album | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const show: Show = (photos, at = 0) => {
    if (photos.length) setAlbum({ photos, at: Math.min(photos.length - 1, Math.max(0, at)) });
  };
  const hide = () => setAlbum(null);
  const goTo = (at: number) => setAlbum((a) => (a ? { ...a, at: (at + a.photos.length) % a.photos.length } : a));

  const isOpen = album !== null;
  const at = album?.at ?? 0;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAlbum(null);
      if (event.key === "ArrowLeft") setAlbum((a) => (a ? { ...a, at: (a.at - 1 + a.photos.length) % a.photos.length } : a));
      if (event.key === "ArrowRight") setAlbum((a) => (a ? { ...a, at: (a.at + 1) % a.photos.length } : a));
    };
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = overflow;
    };
  }, [isOpen]);

  // Keep the current thumbnail visible in the strip.
  useEffect(() => {
    stripRef.current
      ?.querySelector<HTMLElement>("[aria-current='true']")
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [at, isOpen]);

  const photo = album?.photos[at];
  const many = (album?.photos.length ?? 0) > 1;

  const overlay = album && photo && (
    <div className="viewer" role="dialog" aria-modal="true" aria-label={photo.title || photo.alt}>
      <div className="viewer-top">
        <p className="viewer-count">
          {pad(at + 1)} / {pad(album.photos.length)}
          {photo.title && <span> — {photo.title}</span>}
        </p>
        <div className="viewer-controls">
          {many && (
            <>
              <button type="button" aria-label="Image précédente" onClick={() => goTo(at - 1)}>
                ←
              </button>
              <button type="button" aria-label="Image suivante" onClick={() => goTo(at + 1)}>
                →
              </button>
            </>
          )}
          <button type="button" className="viewer-close" onClick={hide}>
            fermer ✕
          </button>
        </div>
      </div>

      <div className="viewer-stage" onClick={hide}>
        <Image
          key={photo.src}
          className="viewer-image"
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes="100vw"
          priority
          onClick={(event) => event.stopPropagation()}
        />
      </div>

      {many && (
        <div className="viewer-strip" ref={stripRef} aria-label="Toutes les photos">
          {album.photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              className="viewer-thumb"
              aria-label={`Photo ${i + 1}`}
              aria-current={i === at ? "true" : undefined}
              onClick={() => goTo(i)}
            >
              <Image src={p.src} alt="" width={96} height={64} sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <ViewerContext.Provider value={show}>
      {children}
      {overlay && typeof document !== "undefined" && createPortal(overlay, document.body)}
    </ViewerContext.Provider>
  );
}

export const usePhotoViewer = () => useContext(ViewerContext);

/** Clickable content that opens `photos` at index `at` in the viewer. */
export function PhotoButton({
  photos,
  at = 0,
  className,
  label = "Agrandir l'image",
  children,
}: {
  photos: Photo[];
  at?: number;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  const show = usePhotoViewer();
  return (
    <button type="button" className={["unfold", className].filter(Boolean).join(" ")} title={label} aria-label={label} onClick={() => show(photos, at)}>
      {children}
    </button>
  );
}
