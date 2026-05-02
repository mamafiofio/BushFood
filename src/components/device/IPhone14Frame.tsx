import type { ReactNode } from "react";
import { MUSEUM_DEVICE } from "../../tokens/museum";

type IPhone14FrameProps = {
  children: ReactNode;
  /** Accessible label for the preview chrome (not a real device frame for AT users on desktop). */
  label?: string;
};

/**
 * Constrains layout to an iPhone 14 logical viewport for prototype review.
 * Dimensions come from `tokens/museum` only.
 */
export function IPhone14Frame({ children, label }: IPhone14FrameProps) {
  const shellRadiusPx = MUSEUM_DEVICE.shellCornerRadiusPx;

  return (
    <div
      className="relative overflow-hidden bg-hunt-chrome ring-1 ring-hunt-chip-border transition-hunt"
      style={{
        width: MUSEUM_DEVICE.widthPx,
        height: MUSEUM_DEVICE.heightPx,
        borderRadius: shellRadiusPx,
      }}
      role="region"
      aria-label={label ?? "Phone preview, iPhone 14 size"}
    >
      <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-hunt-bg">{children}</div>
    </div>
  );
}
