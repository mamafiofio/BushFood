import { X } from "@phosphor-icons/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FOUND_PLANT_COPY } from "../../tokens/foundPlantCopy";
import { HUNT_PLANT_FOUND_MEDIA } from "../../tokens/huntPlantFoundMedia";
import { HUNT_PLANT_TILES, type HuntPlantId } from "../../tokens/huntPlantTiles";
import { MUSEUM_DEVICE } from "../../tokens/museum";
import { HuntPrimaryButton } from "./HuntPrimaryButton";

type PlantFoundSheetProps = {
  plantId: HuntPlantId | null;
  open: boolean;
  /** Called when the sheet finishes closing; `id` is the plant that was shown (null only if unknown). */
  onDismiss: (id: HuntPlantId | null) => void;
  onAddToCollection: () => void;
};

const panelMax = `${MUSEUM_DEVICE.widthPx}px`;

const SHEET_IN_ANIMATION = "hunt-found-sheet-in";
const SHEET_OUT_ANIMATION = "hunt-found-sheet-out";
/** After `--duration-hunt-found-sheet-out` (300ms) if `animationend` does not fire */
const EXIT_FALLBACK_MS = 350;
/** Reveal sticker if sheet enter `animationend` never fires (~`--duration-hunt-found-sheet` + margin) */
const STICKER_REVEAL_FALLBACK_MS = 520;

function animationNameList(e: React.AnimationEvent<HTMLElement>): string[] {
  return e.animationName
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function tileHeroSrc(id: HuntPlantId): string {
  const tile = HUNT_PLANT_TILES.find((t) => t.id === id);
  return tile?.src ?? "";
}

/**
 * Found screen — bottom sheet (one instance per homescreen; content driven by `plantId`).
 */
export function PlantFoundSheet({ plantId, open, onDismiss, onAddToCollection }: PlantFoundSheetProps) {
  const [rendered, setRendered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  /** Keeps sheet content during exit after parent clears `plantId` (e.g. Escape). */
  const [resolvedPlantId, setResolvedPlantId] = useState<HuntPlantId | null>(null);
  const resolvedPlantIdRef = useRef<HuntPlantId | null>(null);
  const exitDoneRef = useRef(false);
  const exitingRef = useRef(false);
  const exitFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    resolvedPlantIdRef.current = resolvedPlantId;
  }, [resolvedPlantId]);

  const clearExitFallback = useCallback(() => {
    if (exitFallbackTimerRef.current != null) {
      clearTimeout(exitFallbackTimerRef.current);
      exitFallbackTimerRef.current = null;
    }
  }, []);

  const completeExit = useCallback(() => {
    if (exitDoneRef.current) return;
    exitDoneRef.current = true;
    clearExitFallback();
    const finishedId = resolvedPlantIdRef.current;
    setResolvedPlantId(null);
    onDismiss(finishedId);
    setExiting(false);
    setRendered(false);
  }, [clearExitFallback, onDismiss]);

  useLayoutEffect(() => {
    exitingRef.current = exiting;
  }, [exiting]);

  useLayoutEffect(() => {
    if (open && plantId != null) {
      exitDoneRef.current = false;
      setRendered(true);
      setExiting(false);
      setShowSticker(false);
      setResolvedPlantId(plantId);
    }
  }, [open, plantId]);

  useLayoutEffect(() => {
    if (!open && rendered) {
      setExiting(true);
    }
  }, [open, rendered]);

  const startExit = useCallback(() => {
    setExiting(true);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    exitDoneRef.current = false;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      completeExit();
      return;
    }
    exitFallbackTimerRef.current = window.setTimeout(completeExit, EXIT_FALLBACK_MS);
    return () => {
      clearExitFallback();
    };
  }, [exiting, completeExit, clearExitFallback]);

  /** Sticker: show after sheet enter ends; reduced motion has no sheet enter event — reveal here or via timeout. */
  useEffect(() => {
    if (!rendered || !open || exiting || showSticker) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShowSticker(true);
      return;
    }
    const id = window.setTimeout(() => setShowSticker(true), STICKER_REVEAL_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [rendered, open, exiting, showSticker]);

  const onSheetMotionAnimationEnd = useCallback(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      const names = animationNameList(e);
      if (names.includes(SHEET_OUT_ANIMATION)) {
        completeExit();
      }
      if (names.includes(SHEET_IN_ANIMATION) && !exitingRef.current) {
        setShowSticker(true);
      }
    },
    [completeExit],
  );

  if (!rendered || resolvedPlantId == null) return null;

  const copy = FOUND_PLANT_COPY[resolvedPlantId];
  const media = HUNT_PLANT_FOUND_MEDIA[resolvedPlantId];
  const heroSrc = tileHeroSrc(resolvedPlantId);
  const titleId = `plant-found-title-${resolvedPlantId}`;

  return createPortal(
    <>
      <div
        role="presentation"
        className={
          exiting
            ? "found-sheet-backdrop-exit fixed inset-0 z-[360] cursor-default bg-black/50"
            : "found-sheet-backdrop-enter fixed inset-0 z-[360] cursor-default bg-black/50"
        }
        onClick={startExit}
      />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[370] flex justify-center px-hunt-screen pt-hunt-gap">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={
            exiting
              ? "found-sheet-panel-exit pointer-events-auto w-full"
              : "found-sheet-panel-enter pointer-events-auto w-full"
          }
          style={{ maxWidth: panelMax }}
          onAnimationEnd={onSheetMotionAnimationEnd}
        >
          <div className="pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]">
            <div className="relative flex min-h-0 max-h-[min(90dvh,844px)] w-full flex-col overflow-hidden rounded-t-[length:var(--radius-device-shell)] bg-hunt-bg text-left shadow-lg ring-1 ring-hunt-chip-border">
              <button
                type="button"
                className="group absolute right-hunt-screen top-hunt-gap z-30 inline-flex size-hunt-touch items-center justify-center rounded-[length:var(--radius-field)] bg-hunt-bg text-hunt-accent-warm ring-1 ring-hunt-chip-border transition-hunt hover:bg-hunt-dark-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hunt-bg"
                onClick={startExit}
                aria-label="Close"
              >
                <X
                  className="size-5 origin-center transition-transform duration-hunt ease-hunt group-hover:rotate-180 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
                  weight="bold"
                  aria-hidden
                />
              </button>

              <div className="found-sheet-scroll min-h-0 w-full flex-1 overflow-y-auto overscroll-y-contain">
                <div className="flex w-full flex-col items-center px-hunt-screen pt-hunt-found-hero-pt">
                  <div className="relative size-[length:var(--size-hunt-plant-tile)] shrink-0">
                    <div className="flex size-full items-center justify-center overflow-hidden rounded-full">
                      <img
                        src={heroSrc}
                        alt=""
                        className="max-h-full max-w-full object-contain object-center"
                      />
                    </div>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute right-0 top-0 z-20 block h-auto w-[38%] max-w-[5.75rem] min-w-[4.25rem] origin-top-right translate-x-[calc(20%+var(--spacing-hunt-gap)-var(--spacing-hunt-stack))] translate-y-[calc(2*var(--spacing-hunt-gap)-2*var(--spacing-hunt-stack)-10%)] rotate-[-15deg]"
                    >
                      <img
                        src={media.stickerSrc}
                        alt=""
                        className={`h-auto w-full select-none ${showSticker ? "found-sticker-pop" : "opacity-0"}`}
                        decoding="async"
                      />
                    </span>
                  </div>
                </div>

                <div className="px-hunt-screen pt-hunt-stack text-center">
                  <p className="text-base font-bold leading-normal text-hunt-text-heading">You found</p>
                  <h1
                    id={titleId}
                    className="mt-hunt-tight-half text-balance font-black text-hunt-h1 tracking-hunt-h1 text-hunt-text-heading"
                  >
                    {copy.displayName}
                  </h1>
                </div>

                <div className="w-full px-hunt-screen py-hunt-found-media-y">
                  <div className="aspect-video w-full overflow-hidden rounded-[length:var(--radius-field)] bg-white/5 ring-1 ring-hunt-chip-border">
                    <img
                      src={media.photoSrc}
                      alt=""
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                </div>

                <div className="px-hunt-screen pb-hunt-gap">
                  <div className="flex flex-col gap-hunt-found-section-gap text-left text-base leading-relaxed">
                    {copy.sections.map((section) => (
                      <section key={section.title}>
                        <h3 className="text-pretty text-hunt-h3 font-bold text-hunt-text-heading">{section.title}</h3>
                        <div className="mt-hunt-found-category-to-body text-pretty font-normal text-hunt-text">
                          {section.body}
                        </div>
                      </section>
                    ))}
                    <section>
                      <a
                        href={copy.wikipediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-sm text-pretty font-bold text-hunt-text-heading underline decoration-hunt-accent-warm underline-offset-2 transition-hunt hover:decoration-hunt-action-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hunt-bg"
                      >
                        View on Wikipedia
                      </a>
                    </section>
                  </div>
                </div>
              </div>

              <div className="shrink-0 px-hunt-screen pt-hunt-gap pb-hunt-screen">
                <HuntPrimaryButton type="button" onClick={onAddToCollection}>
                  Add to collection
                </HuntPrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
