import { useState } from "react";
import { MUSEUM_MOTION } from "../../tokens/museum";
import { HomeScreen } from "./HomeScreen";
import { WelcomeScreen } from "./WelcomeScreen";

const screenTransitionStyle = {
  transitionDuration: `${MUSEUM_MOTION.screenTransitionMs}ms`,
  transitionTimingFunction: MUSEUM_MOTION.easingCss,
} as const;

/**
 * Orchestrates welcome → homescreen with a shared ease-in-out cross-fade.
 */
export function MuseumFlow() {
  const [phase, setPhase] = useState<"welcome" | "home">("welcome");
  const [foragerName, setForagerName] = useState("");

  return (
    <div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden bg-hunt-bg">
      <div
        className={
          phase === "welcome"
            ? "pointer-events-auto absolute inset-0 z-10 flex min-h-0 min-w-0 flex-col overflow-x-hidden opacity-100"
            : "pointer-events-none absolute inset-0 z-0 flex min-h-0 min-w-0 flex-col overflow-x-hidden opacity-0"
        }
        style={{
          ...screenTransitionStyle,
          transitionProperty: "opacity, transform",
          transform: phase === "welcome" ? "translateY(0)" : "translateY(-0.5rem)",
        }}
      >
        <WelcomeScreen
          onStarted={(name) => {
            setForagerName(name);
            setPhase("home");
          }}
        />
      </div>

      <div
        className={
          phase === "home"
            ? "pointer-events-auto absolute inset-0 z-10 flex min-h-0 min-w-0 flex-col overflow-x-hidden opacity-100"
            : "pointer-events-none absolute inset-0 z-0 flex min-h-0 min-w-0 flex-col overflow-x-hidden opacity-0"
        }
        style={{
          ...screenTransitionStyle,
          transitionProperty: "opacity, transform",
          transform: phase === "home" ? "translateY(0)" : "translateY(0.5rem)",
        }}
      >
        <HomeScreen foragerName={foragerName} />
      </div>
    </div>
  );
}
