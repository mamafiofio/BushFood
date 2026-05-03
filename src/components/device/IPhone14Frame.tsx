import type { CSSProperties, ReactNode } from "react";
import { MUSEUM_DEVICE } from "../../tokens/museum";

type IPhone14FrameProps = {
  children: ReactNode;
  /** Accessible label for the chrome region. */
  label?: string;
};

/**
 * Museum app shell: full viewport on phones (PWA / in-gallery), framed preview from `sm` up.
 * Shell dimensions come from `MUSEUM_DEVICE`; content never exceeds viewport width (no horizontal scroll).
 */
export function IPhone14Frame({ children, label }: IPhone14FrameProps) {
  return (
    <div
      className="relative box-border flex w-full max-w-full flex-1 flex-col overflow-x-hidden bg-hunt-chrome min-h-0 min-h-dvh supports-[min-height:100dvh]:min-h-[100dvh] sm:mx-auto sm:my-auto sm:h-[min(100dvh,var(--museum-shell-max-h))] sm:max-h-[min(100dvh,var(--museum-shell-max-h))] sm:min-h-0 sm:w-full sm:max-w-[min(var(--museum-shell-max-w),calc(100vw-2.5rem))] sm:flex-none sm:overflow-hidden sm:rounded-[length:var(--radius-device-shell)] sm:ring-1 sm:ring-hunt-chip-border"
      style={
        {
          ["--museum-shell-max-h" as string]: `${MUSEUM_DEVICE.heightPx}px`,
          ["--museum-shell-max-w" as string]: `${MUSEUM_DEVICE.widthPx}px`,
        } as CSSProperties
      }
      role="region"
      aria-label={label ?? "Bush Food app"}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden rounded-none bg-hunt-bg sm:rounded-[length:var(--radius-device-shell)]">
        {children}
      </div>
    </div>
  );
}
