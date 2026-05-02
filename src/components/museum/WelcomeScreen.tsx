import { useId, useState, type FormEvent } from "react";
import { HuntPrimaryButton } from "./HuntPrimaryButton";

type WelcomeScreenProps = {
  onStarted: (foragerName: string) => void;
};

/**
 * Welcome step: greeting, question, name field, primary action.
 * Figma reference was not readable from this environment; layout follows the shared spec + hunt tokens.
 */
export function WelcomeScreen({ onStarted }: WelcomeScreenProps) {
  const nameFieldId = useId();
  const introId = useId();
  const nameQuestionId = useId();
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onStarted(name);
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col items-center overflow-hidden p-hunt-screen text-center">
      <form
        className="flex min-h-0 w-full max-w-md flex-1 flex-col items-center"
        onSubmit={handleSubmit}
        aria-describedby={introId}
      >
        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-hunt-gap overflow-y-auto">
          <div className="flex w-full flex-col items-center gap-hunt-stack">
            <h1 className="font-black text-balance text-hunt-h1 tracking-tight text-hunt-text-heading">
              Welcome to Bush Food
            </h1>

            <div
              className="flex flex-col gap-hunt-tight font-normal text-base leading-relaxed text-hunt-text"
              id={introId}
            >
              <p className="text-pretty">
                Scan the coloured shapes hidden in the museum to learn about edible native plants in
                Victoria.
              </p>
              <p id={nameQuestionId} className="text-pretty font-bold">
                What&apos;s your forager&apos;s name?
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col items-center">
            <input
              id={nameFieldId}
              name="explorerName"
              type="text"
              autoComplete="name"
              inputMode="text"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-labelledby={nameQuestionId}
              className="min-h-hunt-button w-full rounded-[length:var(--radius-field)] border border-hunt-field-border bg-hunt-field-bg px-hunt-field-x text-center font-normal text-base text-hunt-field-fg placeholder:text-hunt-text-placeholder transition-hunt focus-visible:border-hunt-focus-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hunt-bg"
            />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col pb-hunt-screen pt-hunt-gap">
          <HuntPrimaryButton type="submit">Start foraging</HuntPrimaryButton>
        </div>
      </form>
    </main>
  );
}
