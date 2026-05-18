import { X } from "@phosphor-icons/react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import kangarooGrassLottie from "../../assets/native-plants/lottie/KangarooGrass.json";
import wattleseedLottie from "../../assets/native-plants/lottie/Wattleseed.json";
import { FOUND_PLANT_COPY } from "../../tokens/foundPlantCopy";
import { HUNT_PLANT_FOUND_MEDIA } from "../../tokens/huntPlantFoundMedia";
import { HUNT_PLANT_TILES, type HuntPlantId } from "../../tokens/huntPlantTiles";
import { HuntPrimaryButton } from "./HuntPrimaryButton";

type PlantFoundSheetProps = {
  plantId: HuntPlantId | null;
  open: boolean;
  /** Called when the sheet finishes closing; `id` is the plant that was shown (null only if unknown). */
  onDismiss: (id: HuntPlantId | null) => void;
  onAddToCollection: () => void;
};

const SHEET_OUT_ANIMATION = "hunt-found-sheet-out";
/** After `--duration-hunt-found-sheet-out` (300ms) if `animationend` does not fire */
const EXIT_FALLBACK_MS = 350;
const FOUND_TITLE_PREFIX = "You found ";
const FOUND_PHOTO_DISCLAIMER =
  "For educational purposes only. Do not forage or consume wild plants without guidance from a qualified expert.";
const FOUND_HERO_LOTTIE_PLAY_AFTER_INTRO_MS = 0;

/** Matches found-sheet entrance tokens in index.css (`.found-sheet--enter`). */
const FOUND_ICON_DELAY_MS = 100;
const FOUND_ICON_DURATION_MS = 300;
const FOUND_STICKER_DURATION_MS = 620;
const FOUND_TITLE_LETTER_STAGGER_MS = 30;
const FOUND_TITLE_LETTER_DURATION_MS = 250;
const FOUND_PHOTO_DURATION_MS = 520;

function computeFoundIntroEndMs(titleLetterCount: number): number {
  const stickerEndMs = FOUND_ICON_DELAY_MS + FOUND_ICON_DURATION_MS + FOUND_STICKER_DURATION_MS;
  const titleEndMs =
    stickerEndMs +
    (titleLetterCount - 1) * FOUND_TITLE_LETTER_STAGGER_MS +
    FOUND_TITLE_LETTER_DURATION_MS;
  return titleEndMs + FOUND_PHOTO_DURATION_MS;
}

function FoundSheetHeroLottie({
  animationData,
  playDelayMs,
  active,
}: {
  animationData: typeof wattleseedLottie | typeof kangarooGrassLottie;
  playDelayMs: number;
  active: boolean;
}) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (!active) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      lottieRef.current?.goToAndStop(0, true);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lottieRef.current?.goToAndPlay(0, true);
    }, playDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [active, playDelayMs]);

  const handleReady = useCallback(() => {
    lottieRef.current?.goToAndStop(0, true);
  }, []);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={false}
      autoplay={false}
      onDOMLoaded={handleReady}
      className="max-h-full max-w-full"
    />
  );
}

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

function FoundTitleLetters({
  prefix,
  plantName,
  titleId,
  animate,
}: {
  prefix: string;
  plantName: string;
  titleId: string;
  animate: boolean;
}) {
  if (!animate) {
    return (
      <div className="min-w-0 px-hunt-screen pt-hunt-stack text-center">
        <p className="text-base font-bold leading-normal text-hunt-text-heading">{prefix.trim()}</p>
        <h1
          id={titleId}
          className="mt-0 text-balance font-black text-hunt-h1 tracking-hunt-h1 text-hunt-text-heading"
        >
          {plantName}
        </h1>
      </div>
    );
  }

  let letterIndex = 0;

  return (
    <div className="min-w-0 px-hunt-screen pt-hunt-stack text-center">
      <p className="sr-only">
        {prefix}
        {plantName}
      </p>
      <div aria-hidden>
        <p className="text-base font-bold leading-normal text-hunt-text-heading">
          {[...prefix].map((char, charIndex) => {
            const index = letterIndex++;
            return (
              <span
                key={`prefix-${charIndex}`}
                className="welcome-title-letter found-sheet-title-letter"
                style={{ "--welcome-letter-index": index } as CSSProperties}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </p>
        <h1
          id={titleId}
          className="mt-0 text-balance font-black text-hunt-h1 tracking-hunt-h1 text-hunt-text-heading"
        >
          {[...plantName].map((char, charIndex) => {
            const index = letterIndex++;
            return (
              <span
                key={`name-${charIndex}`}
                className="welcome-title-letter found-sheet-title-letter"
                style={{ "--welcome-letter-index": index } as CSSProperties}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </h1>
      </div>
    </div>
  );
}

/**
 * Found screen — bottom sheet (one instance per homescreen; content driven by `plantId`).
 */
export function PlantFoundSheet({ plantId, open, onDismiss, onAddToCollection }: PlantFoundSheetProps) {
  const [rendered, setRendered] = useState(false);
  const [exiting, setExiting] = useState(false);
  /** Keeps sheet content during exit after parent clears `plantId` (e.g. Escape). */
  const [resolvedPlantId, setResolvedPlantId] = useState<HuntPlantId | null>(null);
  const resolvedPlantIdRef = useRef<HuntPlantId | null>(null);
  const exitDoneRef = useRef(false);
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
    if (open && plantId != null) {
      exitDoneRef.current = false;
      setRendered(true);
      setExiting(false);
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

  const onSheetMotionAnimationEnd = useCallback(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (animationNameList(e).includes(SHEET_OUT_ANIMATION)) {
        completeExit();
      }
    },
    [completeExit],
  );

  if (!rendered || resolvedPlantId == null) return null;

  const copy = FOUND_PLANT_COPY[resolvedPlantId];
  const media = HUNT_PLANT_FOUND_MEDIA[resolvedPlantId];
  const heroSrc = tileHeroSrc(resolvedPlantId);
  const titleId = `plant-found-title-${resolvedPlantId}`;
  const showEntrance = !exiting;
  /** Keep post-entrance layout/transforms while the panel exits (avoids shrink before unmount). */
  const holdEntranceLayout = showEntrance || exiting;
  const foundTitleLetterCount = FOUND_TITLE_PREFIX.length + copy.displayName.length;
  const foundEntranceStyle = {
    "--found-title-letter-count": foundTitleLetterCount,
  } as CSSProperties;
  const foundIntroEndMs = computeFoundIntroEndMs(foundTitleLetterCount);
  const heroLottiePlayDelayMs = showEntrance
    ? foundIntroEndMs + FOUND_HERO_LOTTIE_PLAY_AFTER_INTRO_MS
    : 0;
  const heroLottieData =
    resolvedPlantId === "wattleseed"
      ? wattleseedLottie
      : resolvedPlantId === "kangaroo-grass"
        ? kangarooGrassLottie
        : null;

  return createPortal(
    <>
      <div
        role="presentation"
        className={
          exiting
            ? "found-sheet-backdrop-exit found-sheet-bg fixed inset-0 z-[360] cursor-default"
            : "found-sheet-backdrop-enter found-sheet-bg fixed inset-0 z-[360] cursor-default"
        }
        onClick={startExit}
      />
      <div
        role="dialog"
        aria-modal="true"
          aria-labelledby={titleId}
          className={
            exiting
              ? "found-sheet-panel-exit found-sheet-bg fixed inset-0 z-[370] flex min-h-0 w-full min-w-0 flex-col overflow-hidden text-left"
              : "found-sheet-bg fixed inset-0 z-[370] flex min-h-0 w-full min-w-0 flex-col overflow-hidden text-left"
          }
          onAnimationEnd={onSheetMotionAnimationEnd}
        >
            <div
              className={`relative flex min-h-0 flex-1 w-full min-w-0 flex-col overflow-x-hidden overflow-y-hidden${holdEntranceLayout ? " found-sheet-shell-enter found-sheet--enter" : ""}`}
              style={holdEntranceLayout ? foundEntranceStyle : undefined}
            >
              <button
                type="button"
                className={`group absolute right-hunt-screen top-hunt-gap z-30 inline-flex size-hunt-touch items-center justify-center rounded-[length:var(--radius-field)] bg-hunt-bg text-hunt-accent-warm ring-1 ring-hunt-chip-border backdrop-blur-sm transition-hunt hover:bg-hunt-dark-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hunt-bg${holdEntranceLayout ? " found-sheet-close-enter" : ""}`}
                onClick={startExit}
                aria-label="Close"
              >
                <X
                  className="size-5 origin-center transition-transform duration-hunt ease-hunt group-hover:rotate-180 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
                  weight="bold"
                  aria-hidden
                />
              </button>

              <div className="found-sheet-scroll min-h-0 w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
                <div className="flex w-full min-w-0 flex-col items-center px-hunt-screen pt-hunt-found-hero-pt">
                  <div className="relative mx-auto aspect-square w-full max-w-[min(100%,var(--size-hunt-plant-tile))] shrink-0">
                    <div
                      className={`flex size-full items-center justify-center overflow-hidden rounded-full${holdEntranceLayout ? " found-sheet-hero-icon" : ""}`}
                    >
                      {heroLottieData != null ? (
                        <FoundSheetHeroLottie
                          animationData={heroLottieData}
                          playDelayMs={heroLottiePlayDelayMs}
                          active={showEntrance}
                        />
                      ) : (
                        <img
                          src={heroSrc}
                          alt=""
                          className="max-h-full max-w-full object-contain object-center"
                        />
                      )}
                    </div>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute right-0 top-0 z-20 block h-auto w-[38%] max-w-[5.75rem] min-w-[4.25rem] origin-top-right translate-x-[calc(20%+var(--spacing-hunt-gap)-var(--spacing-hunt-stack))] translate-y-[calc(2*var(--spacing-hunt-gap)-2*var(--spacing-hunt-stack)-10%)] rotate-[-15deg]"
                    >
                      <img
                        src={media.stickerSrc}
                        alt=""
                        className={`h-auto w-full select-none${holdEntranceLayout ? " found-sheet-hero-sticker" : ""}`}
                        decoding="async"
                      />
                    </span>
                  </div>
                </div>

                <FoundTitleLetters
                  prefix={FOUND_TITLE_PREFIX}
                  plantName={copy.displayName}
                  titleId={titleId}
                  animate={holdEntranceLayout}
                />

                <div className="w-full min-w-0 px-hunt-screen py-hunt-found-media-y">
                  <div
                    className={`aspect-video w-full min-w-0 overflow-hidden rounded-[length:var(--radius-field)] bg-white/5${holdEntranceLayout ? " found-sheet-photo-reveal" : ""}`}
                  >
                    <img
                      src={media.photoSrc}
                      alt=""
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <p className="mt-hunt-tight text-pretty text-md italic text-white/60">
                    {FOUND_PHOTO_DISCLAIMER}
                  </p>
                </div>

                <div className={`min-w-0 px-hunt-screen pb-hunt-gap${holdEntranceLayout ? " found-sheet-body-reveal" : ""}`}>
                  <div className="flex min-w-0 flex-col gap-hunt-found-section-gap text-left text-base leading-relaxed">
                    {copy.sections.map((section) => (
                      <section key={section.title} className="min-w-0">
                        <h3 className="text-pretty text-hunt-h3 font-bold text-hunt-text-heading">
                          {section.title}
                        </h3>
                        <div className="mt-hunt-found-category-to-body max-w-full break-words text-pretty font-normal text-hunt-text">
                          {section.body}
                        </div>
                      </section>
                    ))}
                    <section className="min-w-0">
                      <a
                        href={copy.wikipediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full break-words rounded-sm text-pretty font-bold text-hunt-text-heading underline decoration-hunt-accent-warm underline-offset-2 transition-hunt hover:decoration-hunt-action-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hunt-bg"
                      >
                        View on Wikipedia
                      </a>
                    </section>
                  </div>
                </div>
              </div>

              <div
                className={`min-w-0 shrink-0 px-hunt-screen pt-hunt-gap pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]${holdEntranceLayout ? " found-sheet-body-reveal" : ""}`}
              >
                <HuntPrimaryButton type="button" onClick={onAddToCollection}>
                  Add to collection
                </HuntPrimaryButton>
              </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
