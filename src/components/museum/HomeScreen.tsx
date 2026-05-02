import { HUNT_PLANT_TILES } from "../../tokens/huntPlantTiles";
import { HuntPrimaryButton } from "./HuntPrimaryButton";

type HomeScreenProps = {
  foragerName: string;
};

/**
 * Post-welcome homescreen — plant grid + scan action (Figma `2_Homescreen`).
 */
export function HomeScreen({ foragerName }: HomeScreenProps) {
  const greeting = foragerName.trim() ? `Hi ${foragerName.trim()}` : "Hi there";

  return (
    <main className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-hunt-bg text-center">
      <header className="shrink-0 px-hunt-screen pt-[80px]">
        <h2 className="font-black text-balance text-hunt-h1 tracking-tight text-hunt-text-heading">
          {greeting}
        </h2>
        <p className="mt-hunt-tight text-pretty text-base font-normal leading-relaxed text-hunt-text-subhead">
          Find plant markers in the galleries and scan them with your camera.
        </p>
      </header>

      <div className="mt-hunt-stack min-h-0 flex-1 overflow-y-auto bg-hunt-bg px-hunt-screen py-hunt-gap">
        <ul
          className="mx-auto grid w-full max-w-md grid-cols-2 justify-items-center gap-hunt-gap"
          role="list"
        >
          {HUNT_PLANT_TILES.map((plant) => (
            <li key={plant.id} className="w-full max-w-[length:var(--size-hunt-plant-tile)]">
              <button
                type="button"
                className="aspect-square w-full overflow-hidden rounded-full transition-hunt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hunt-bg"
                aria-label={plant.label}
              >
                <img src={plant.src} alt="" className="h-full w-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex w-full shrink-0 flex-col px-hunt-screen pb-hunt-screen pt-hunt-gap">
        <div className="mx-auto w-full max-w-md">
          <HuntPrimaryButton type="button">Scan</HuntPrimaryButton>
        </div>
      </div>
    </main>
  );
}
