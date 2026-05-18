import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { HUNT_WELCOME_MARQUEE_LOOP_COPIES, HUNT_WELCOME_MARQUEE_TILES } from "../../tokens/huntPlantTiles";

/** Matches `--duration-hunt-welcome-marquee` in index.css */
const MARQUEE_DURATION_MS = 42_000;

function readTranslateX(element: HTMLElement): number {
  const transform = getComputedStyle(element).transform;
  if (!transform || transform === "none") return 0;
  return new DOMMatrix(transform).m41;
}

function readMarqueeDurationMs(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--duration-hunt-welcome-marquee")
    .trim();
  if (!raw) return MARQUEE_DURATION_MS;
  if (raw.endsWith("ms")) return Number.parseFloat(raw);
  if (raw.endsWith("s")) return Number.parseFloat(raw) * 1000;
  return MARQUEE_DURATION_MS;
}

/**
 * Infinite horizontal plant marquee — auto-scrolls; pointer drag overrides and resumes in place.
 */
export function WelcomeMarquee() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const loopWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const durationMsRef = useRef(MARQUEE_DURATION_MS);
  const reducedMotionRef = useRef(false);
  const dragRef = useRef<{ pointerId: number; startX: number; startOffset: number } | null>(null);

  const tilesPerLoop = HUNT_WELCOME_MARQUEE_TILES.length;
  const loopCopies = Math.max(2, HUNT_WELCOME_MARQUEE_LOOP_COPIES);
  const expectedTileCount = tilesPerLoop * loopCopies;

  const measureLoop = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length < expectedTileCount) return;
    const secondCopyStart = track.children[tilesPerLoop] as HTMLElement | undefined;
    loopWidthRef.current =
      secondCopyStart?.offsetLeft ?? track.scrollWidth / loopCopies;
  }, [expectedTileCount, loopCopies, tilesPerLoop]);

  const normalizeOffset = useCallback((offset: number) => {
    const loop = loopWidthRef.current;
    if (loop <= 0) return offset;
    let next = offset;
    while (next > 0) next -= loop;
    while (next <= -loop) next += loop;
    return next;
  }, []);

  const applyDragOffset = useCallback(
    (offset: number) => {
      const track = trackRef.current;
      if (!track) return;

      const loop = loopWidthRef.current;
      const normalized = loop > 0 ? normalizeOffset(offset) : offset;

      // Keep pointer delta 1:1 when we wrap across a loop boundary (invisible jump).
      if (dragRef.current && loop > 0) {
        const wrapDelta = normalized - offset;
        if (wrapDelta !== 0) {
          dragRef.current.startOffset += wrapDelta;
        }
      }

      offsetRef.current = normalized;
      track.style.transform = `translate3d(${normalized}px, 0, 0)`;
    },
    [normalizeOffset],
  );

  const pauseForDrag = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    measureLoop();
    const currentX = normalizeOffset(readTranslateX(track));
    offsetRef.current = currentX;
    track.style.animation = "none";
    track.style.transform = `translate3d(${currentX}px, 0, 0)`;
  }, [measureLoop, normalizeOffset]);

  const resumeAnimation = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const loop = loopWidthRef.current;
    const offset = loop > 0 ? normalizeOffset(offsetRef.current) : offsetRef.current;
    offsetRef.current = offset;

    if (reducedMotionRef.current || loop <= 0) {
      track.style.animation = "none";
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
      return;
    }

    const durationMs = durationMsRef.current;
    const progress = Math.abs(offset) / loop;
    const delaySec = -progress * (durationMs / 1000);

    track.style.animation = "none";
    void track.offsetHeight;
    track.style.removeProperty("transform");
    track.style.animation = `hunt-welcome-marquee ${durationMs}ms linear infinite`;
    track.style.animationDelay = `${delaySec}s`;
  }, [normalizeOffset]);

  useEffect(() => {
    durationMsRef.current = readMarqueeDurationMs();
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    measureLoop();
    const track = trackRef.current;
    if (!track) return;

    const ro = new ResizeObserver(() => {
      measureLoop();
    });
    ro.observe(track);

    if (!reducedMotionRef.current) {
      track.style.animation = `hunt-welcome-marquee ${durationMsRef.current}ms linear infinite`;
    }

    return () => ro.disconnect();
  }, [measureLoop]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    measureLoop();
    pauseForDrag();
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startOffset: offsetRef.current,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    viewportRef.current?.classList.add("welcome-marquee-viewport--dragging");
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    applyDragOffset(drag.startOffset + (e.clientX - drag.startX));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    viewportRef.current?.classList.remove("welcome-marquee-viewport--dragging");
    resumeAnimation();
  };

  return (
    <div
      ref={viewportRef}
      className="welcome-marquee-viewport flex h-full min-h-0 w-full min-w-0 items-center justify-start overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      aria-hidden
    >
      <div ref={trackRef} className="welcome-marquee-track gap-hunt-gap py-hunt-tight">
        {Array.from({ length: loopCopies }, (_, copyIndex) =>
          HUNT_WELCOME_MARQUEE_TILES.map((plant) => (
            <div
              key={`${plant.id}-copy-${copyIndex}`}
              className="flex size-[length:var(--size-hunt-welcome-marquee-tile)] shrink-0 items-center justify-center"
            >
              <img
                src={plant.src}
                alt=""
                className="h-full w-full object-contain object-center"
                draggable={false}
                loading="eager"
                decoding="sync"
                onLoad={measureLoop}
              />
            </div>
          )),
        )}
      </div>
    </div>
  );
}
