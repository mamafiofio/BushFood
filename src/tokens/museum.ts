/**
 * Central numeric and motion constants for the museum hunt prototype.
 * UI components should import from here (or CSS theme variables) instead of inlining values.
 */

/** iPhone 14 logical viewport (CSS pixels). */
export const MUSEUM_DEVICE = {
  widthPx: 390,
  heightPx: 844,
  /** Outer chrome corner radius for the device preview frame. */
  shellCornerRadiusPx: 44,
  /** Simulated display inset inside the chrome (optional future use). */
  displayInsetPx: 0,
} as const;

/** Local dev preview — smaller logical viewport (e.g. narrow Android). */
export const MUSEUM_DEV_PREVIEW_DEVICE = {
  widthPx: 360,
  heightPx: 667,
} as const;

export const MUSEUM_MOTION = {
  durationMs: 200,
  /** Welcome ↔ homescreen cross-fade (matches `--duration-hunt-screen`). */
  screenTransitionMs: 420,
  /** Standard ease-in-out for UI transitions. */
  easingCss: "cubic-bezier(0.42, 0, 0.58, 1)",
} as const;

export const MUSEUM_LAYOUT = {
  screenPaddingPx: 20,
  sectionGapPx: 24,
  /** Primary control corner radius (tokens also exposed as CSS --radius-button). */
  buttonRadiusPx: 16,
} as const;

/** Phosphor `size` prop values — keep icon dimensions out of JSX literals. */
export const HUNT_ICON = {
  inline: 22,
} as const;
