import { X } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { WATTLESEED_FOUND_COPY } from "../../tokens/foundPlantCopy";
import { MUSEUM_DEVICE } from "../../tokens/museum";
import stickerArt from "../../assets/museum/sticker.svg";
import wattleseedArt from "../../assets/native-plants/Wattleseed.svg";
import { HuntPrimaryButton } from "./HuntPrimaryButton";

type WattleseedFoundSheetProps = {
  open: boolean;
  onDismiss: () => void;
  onAddToCollection: () => void;
};

const panelMax = `${MUSEUM_DEVICE.widthPx}px`;

/**
 * Found screen — bottom sheet template (opens from the Wattleseed tile for now; layout reused for other plants later).
 */
export function WattleseedFoundSheet({ open, onDismiss, onAddToCollection }: WattleseedFoundSheetProps) {
  if (!open) return null;

  const copy = WATTLESEED_FOUND_COPY;

  return createPortal(
    <>
      <div
        role="presentation"
        className="fixed inset-0 z-[360] cursor-default bg-black/50"
        onClick={onDismiss}
      />
      <div
        className="fixed inset-x-0 bottom-0 z-[370] flex justify-center px-hunt-screen pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-hunt-gap"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wattleseed-found-title"
      >
        <div
          className="relative flex min-h-0 max-h-[min(90dvh,844px)] w-full flex-col overflow-hidden rounded-t-[length:var(--radius-device-shell)] bg-hunt-bg text-left shadow-lg ring-1 ring-hunt-chip-border"
          style={{ maxWidth: panelMax }}
        >
          <button
            type="button"
            className="absolute right-hunt-screen top-hunt-gap z-30 inline-flex size-hunt-touch items-center justify-center rounded-[length:var(--radius-field)] bg-hunt-bg text-hunt-accent-warm ring-1 ring-hunt-chip-border transition-hunt hover:bg-hunt-dark-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hunt-bg"
            onClick={onDismiss}
            aria-label="Close"
          >
            <X className="size-5" weight="bold" aria-hidden />
          </button>

          <div className="found-sheet-scroll min-h-0 w-full flex-1 overflow-y-auto overscroll-y-contain">
            <div className="flex w-full flex-col items-center px-hunt-screen pt-hunt-found-hero-pt">
              <div className="relative size-[length:var(--size-hunt-plant-tile)] shrink-0">
                <div className="flex size-full items-center justify-center overflow-hidden rounded-full">
                  <img
                    src={wattleseedArt}
                    alt=""
                    className="max-h-full max-w-full object-contain object-center"
                  />
                </div>
                <img
                  src={stickerArt}
                  alt=""
                  className="pointer-events-none absolute right-0 top-0 z-20 h-auto w-[38%] max-w-[5.75rem] min-w-[4.25rem] origin-top-right translate-x-[calc(20%+var(--spacing-hunt-gap)-var(--spacing-hunt-stack))] translate-y-[calc(2*var(--spacing-hunt-gap)-2*var(--spacing-hunt-stack)-10%)] rotate-[-15deg] scale-[1.2] select-none"
                  decoding="async"
                  aria-hidden
                />
              </div>
            </div>

            <div className="px-hunt-screen pt-hunt-stack text-center">
              <p className="text-base font-bold leading-normal text-hunt-text-heading">You found</p>
              <h1
                id="wattleseed-found-title"
                className="mt-hunt-tight-half text-balance font-black text-hunt-h1 tracking-hunt-h1 text-hunt-text-heading"
              >
                {copy.displayName}
              </h1>
            </div>

            <div className="w-full px-hunt-screen py-hunt-found-media-y">
              <div
                className="aspect-video w-full overflow-hidden rounded-[length:var(--radius-field)] bg-white/5 ring-1 ring-hunt-chip-border"
                aria-hidden
              />
            </div>

            <div className="px-hunt-screen pb-hunt-gap">
              <div className="flex flex-col gap-hunt-found-section-gap text-left text-base leading-relaxed">
                {copy.sections.map((section) => (
                  <section key={section.title}>
                    <h2 className="text-pretty font-bold text-hunt-text-heading">{section.title}</h2>
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

          <div className="shrink-0 px-hunt-screen py-hunt-gap">
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
