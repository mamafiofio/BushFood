import { useId, useState, type CSSProperties, type FormEvent } from "react";
import melbourneMuseumLogo from "../../assets/melbourne-museum-logo-white.png";
import { HuntPrimaryButton } from "./HuntPrimaryButton";
import { WelcomeMarquee } from "./WelcomeMarquee";

type WelcomeScreenProps = {
  onStarted: (foragerName: string) => void;
};

const WELCOME_TITLE_LINES = ["Welcome to", "Bush Food"] as const;
const WELCOME_INTRO_LINES = [
  "Scan the coloured shapes hidden",
  "in the museum to learn about",
  "edible native plants in Victoria.",
] as const;
const WELCOME_TITLE_LETTER_COUNT = WELCOME_TITLE_LINES.reduce((sum, line) => sum + line.length, 0);

const welcomeEntranceStyle = {
  "--welcome-title-letter-count": WELCOME_TITLE_LETTER_COUNT,
} as CSSProperties;

function WelcomeTitle() {
  let letterIndex = 0;

  return (
    <h1 className="font-black text-balance text-hunt-h1 tracking-hunt-h1 text-hunt-text-heading">
      <span className="sr-only">Welcome to Bush Food</span>
      <span aria-hidden className="welcome-title-visual">
        {WELCOME_TITLE_LINES.map((line, lineIndex) => (
          <span key={line} className={lineIndex > 0 ? "block" : undefined}>
            {[...line].map((char, charIndex) => {
              const index = letterIndex++;
              return (
                <span
                  key={`${lineIndex}-${charIndex}`}
                  className="welcome-title-letter"
                  style={{ "--welcome-letter-index": index } as CSSProperties}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </h1>
  );
}

/**
 * Welcome step — title/intro pinned top, form pinned bottom, marquee vertically centered between.
 */
export function WelcomeScreen({ onStarted }: WelcomeScreenProps) {
  const nameFieldId = useId();
  const introId = useId();
  const [name, setName] = useState("");
  const [nameFieldFocused, setNameFieldFocused] = useState(false);

  const showNamePlaceholder = !nameFieldFocused && name.length === 0;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onStarted(name);
  }

  return (
    <main className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-transparent text-center">
      <form
        className="welcome-screen-form welcome-screen--enter grid min-h-0 w-full min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden"
        style={welcomeEntranceStyle}
        onSubmit={handleSubmit}
        aria-describedby={introId}
      >
        <header className="welcome-screen-header relative shrink-0 px-hunt-screen pt-[length:var(--spacing-hunt-welcome-title-pt)]">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 flex h-[length:var(--spacing-hunt-welcome-title-pt)] items-center justify-center"
            aria-hidden
          >
            <img
              src={melbourneMuseumLogo}
              alt=""
              className="h-[20px] w-auto max-w-full translate-y-[20px] object-contain object-center"
              decoding="async"
            />
          </div>
          <div className="mx-auto mt-[35px] flex w-full min-w-0 max-w-md flex-col items-center">
            <WelcomeTitle />

            <p
              id={introId}
              className="mx-auto mt-hunt-stack w-full max-w-none -mx-hunt-screen text-pretty text-base font-normal leading-relaxed text-hunt-text-subhead"
            >
              {WELCOME_INTRO_LINES.map((line, index) => (
                <span
                  key={line}
                  className="welcome-screen-intro-line block"
                  style={{ "--welcome-intro-line-index": index } as CSSProperties}
                >
                  {line}
                </span>
              ))}
            </p>
          </div>
        </header>

        <div className="welcome-screen-marquee flex h-full min-h-0 w-full min-w-0 items-center justify-center">
          <WelcomeMarquee />
        </div>

        <footer className="welcome-screen-footer relative z-10 flex w-full min-w-0 shrink-0 flex-col items-center gap-hunt-stack border-hunt-chip-border/40 bg-transparent px-hunt-screen pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-hunt-gap">
          <div className="welcome-screen-field-reveal w-full min-w-0 max-w-md">
            <input
              id={nameFieldId}
              name="explorerName"
              type="text"
              autoComplete="off"
              inputMode="text"
              enterKeyHint="done"
              placeholder={showNamePlaceholder ? "What's your forager's name?" : ""}
              aria-label="What's your forager's name?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFieldFocused(true)}
              onBlur={() => setNameFieldFocused(false)}
              className="h-hunt-button max-h-hunt-button min-h-hunt-button w-full rounded-[length:var(--radius-field)] border border-hunt-field-border bg-hunt-field-bg px-hunt-field-x text-center font-normal text-base text-hunt-field-fg placeholder:text-hunt-text-placeholder transition-hunt focus:placeholder:opacity-0 focus-visible:border-hunt-focus-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-1 focus-visible:ring-offset-hunt-bg"
            />
          </div>
          <div className="welcome-screen-button-reveal w-full min-w-0 max-w-md">
            <HuntPrimaryButton type="submit">Start Foraging</HuntPrimaryButton>
          </div>
        </footer>
      </form>
    </main>
  );
}
