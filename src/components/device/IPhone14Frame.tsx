import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { MUSEUM_DEV_PREVIEW_DEVICE, MUSEUM_DEVICE } from "../../tokens/museum";

type IPhone14FrameProps = {
  children: ReactNode;
  /** Accessible label for the chrome region. */
  label?: string;
};

/** Matches Tailwind `sm` — framed dev preview only at this width and up (desktop). */
const DEV_FRAMED_PREVIEW_MIN_WIDTH_PX = 640;

function readDevFramedPreview(): boolean {
  if (!import.meta.env.DEV) return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(min-width: ${DEV_FRAMED_PREVIEW_MIN_WIDTH_PX}px)`).matches;
}

/** True in `npm run dev` on a wide viewport (Cursor / desktop), not on a real phone over LAN. */
export function useDevFramedPreview(): boolean {
  const [framed, setFramed] = useState(readDevFramedPreview);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      setFramed(false);
      return;
    }
    const mq = window.matchMedia(`(min-width: ${DEV_FRAMED_PREVIEW_MIN_WIDTH_PX}px)`);
    const update = () => setFramed(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return framed;
}

/**
 * Museum app shell: full viewport on phones (PWA / in-gallery + local dev on device).
 * In `npm run dev` on desktop (≥640px), a fixed 360×667 frame is shown for small-screen checks.
 */
export function IPhone14Frame({ children, label }: IPhone14FrameProps) {
  const devFramed = useDevFramedPreview();
  const shellDimensions = devFramed ? MUSEUM_DEV_PREVIEW_DEVICE : MUSEUM_DEVICE;

  const shellStyle = {
    ["--museum-shell-max-h" as string]: `${shellDimensions.heightPx}px`,
    ["--museum-shell-max-w" as string]: `${shellDimensions.widthPx}px`,
  } as CSSProperties;

  if (devFramed) {
    return (
      <div
        className="relative box-border flex h-[length:var(--museum-shell-max-h)] max-h-[length:var(--museum-shell-max-h)] w-[length:var(--museum-shell-max-w)] max-w-[length:var(--museum-shell-max-w)] shrink-0 flex-col overflow-hidden rounded-[length:var(--radius-device-shell)] bg-transparent ring-1 ring-hunt-chip-border"
        style={shellStyle}
        role="region"
        aria-label={label ?? "Bush Food app — dev preview 360×667"}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden rounded-[length:var(--radius-device-shell)] bg-transparent">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative box-border flex w-full max-w-full flex-1 flex-col overflow-x-hidden bg-transparent min-h-0 min-h-dvh supports-[min-height:100dvh]:min-h-[100dvh] sm:mx-auto sm:my-auto sm:h-[min(100dvh,var(--museum-shell-max-h))] sm:max-h-[min(100dvh,var(--museum-shell-max-h))] sm:min-h-0 sm:w-full sm:max-w-[min(var(--museum-shell-max-w),calc(100vw-2.5rem))] sm:flex-none sm:overflow-hidden sm:rounded-[length:var(--radius-device-shell)] sm:ring-1 sm:ring-hunt-chip-border"
      style={shellStyle}
      role="region"
      aria-label={label ?? "Bush Food app"}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden rounded-none bg-transparent sm:rounded-[length:var(--radius-device-shell)]">
        {children}
      </div>
    </div>
  );
}
