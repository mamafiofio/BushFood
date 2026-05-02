import { useId, useState, type FormEvent } from "react";
import { HUNT_PLANT_TILES } from "../../tokens/huntPlantTiles";
import { HuntPrimaryButton } from "./HuntPrimaryButton";

type WelcomeScreenProps = {
  onStarted: (foragerName: string) => void;
};

/**
 * Welcome step — Bush Food title, intro, scrolling plant icons, name + primary action.
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

  const marqueePlants = [...HUNT_PLANT_TILES, ...HUNT_PLANT_TILES];

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-hunt-bg text-center">
      <form
        className="flex min-h-0 w-full flex-1 flex-col"
        onSubmit={handleSubmit}
        aria-describedby={introId}
      >
        <div className="flex min-h-0 w-full flex-1 flex-col items-center overflow-y-auto px-hunt-screen pt-hunt-welcome-title-pt">
          <div className="flex w-full max-w-md flex-col items-center">
            <h1 className="font-black text-balance text-hunt-h1 tracking-hunt-h1 text-hunt-text-heading">
              Welcome to
              <br />
              Bush Food
            </h1>

            <p
              id={introId}
              className="mx-hunt-subhead-inline mt-hunt-stack text-pretty text-base font-normal leading-relaxed text-hunt-text-subhead"
            >
              Scan the coloured shapes hidden in the museum to learn about edible native plants in
              Victoria.
            </p>
          </div>

          <div
            className="relative mt-hunt-gap min-w-0 shrink-0 self-stretch overflow-hidden [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] -mx-hunt-screen"
            aria-hidden
          >
            <div className="welcome-marquee-track gap-hunt-gap py-hunt-tight">
              {marqueePlants.map((plant, i) => (
                <div
                  key={`${plant.id}-${i}`}
                  className="flex size-[length:var(--size-hunt-welcome-marquee-tile)] shrink-0 items-center justify-center"
                >
                  <img
                    src={plant.src}
                    alt=""
                    className="h-full w-full object-contain object-center"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col items-center gap-hunt-stack px-hunt-screen pb-hunt-screen pt-hunt-gap">
          <div className="flex w-full max-w-md flex-col items-center gap-hunt-stack text-center">
            <label
              id={nameQuestionId}
              htmlFor={nameFieldId}
              className="text-pretty text-hunt-h2 font-semibold text-hunt-text"
            >
              What&apos;s your forager&apos;s name?
            </label>
            <input
              id={nameFieldId}
              name="explorerName"
              type="text"
              autoComplete="name"
              inputMode="text"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-hunt-button w-full rounded-[length:var(--radius-field)] border border-hunt-field-border bg-hunt-field-bg px-hunt-field-x text-center font-normal text-base text-hunt-field-fg placeholder:text-hunt-text-placeholder transition-hunt focus-visible:border-hunt-focus-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hunt-bg"
            />
          </div>
          <div className="w-full max-w-md">
            <HuntPrimaryButton type="submit">Start Foraging</HuntPrimaryButton>
          </div>
        </div>
      </form>
    </main>
  );
}
