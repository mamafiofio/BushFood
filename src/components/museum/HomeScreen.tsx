import { useCallback, useEffect, useRef, useState } from "react";
import { HUNT_PLANT_FOUND_MEDIA } from "../../tokens/huntPlantFoundMedia";
import { HUNT_PLANT_TILES, type HuntPlantId } from "../../tokens/huntPlantTiles";
import { HuntPrimaryButton } from "./HuntPrimaryButton";
import { PlantFoundSheet } from "./PlantFoundSheet";

type HomeScreenProps = {
  foragerName: string;
};

/**
 * Post-welcome homescreen — plant grid + scan action (Figma `2_Homescreen`).
 * Found sheet opens from each plant tile (wireframe `4_Success camera scan screen` in Native-plants); camera marker flow is deferred.
 * Camera: `getUserMedia` on desktop (webcam) and mobile; `facingMode: environment` prefers rear camera when available.
 */
export function HomeScreen({ foragerName }: HomeScreenProps) {
  const greeting = foragerName.trim() ? `Hi ${foragerName.trim()}` : "Hi there";
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [foundPlant, setFoundPlant] = useState<HuntPlantId | null>(null);
  /** Plants whose Found sheet has been closed at least once — show sticker on the homescreen tile. */
  const [plantsWithHomeSticker, setPlantsWithHomeSticker] = useState<Set<HuntPlantId>>(() => new Set());
  const [cameraError, setCameraError] = useState<string | null>(null);

  const rememberHomeSticker = useCallback((id: HuntPlantId | null) => {
    if (id == null) return;
    setPlantsWithHomeSticker((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const stopScan = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanOpen(false);
    setFoundPlant(null);
    setCameraError(null);
  }, []);

  const startScan = useCallback(async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setScanOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not access the camera.";
      setCameraError(message);
    }
  }, []);

  useEffect(() => {
    if (!scanOpen || !streamRef.current || !videoRef.current) return;
    const el = videoRef.current;
    el.srcObject = streamRef.current;
    void el.play();
  }, [scanOpen]);

  useEffect(() => () => stopScan(), [stopScan]);

  useEffect(() => {
    if (!scanOpen && foundPlant == null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (foundPlant != null) {
        setFoundPlant(null);
      } else {
        stopScan();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [scanOpen, foundPlant, stopScan]);

  const handleAddToCollection = useCallback(() => {
    setFoundPlant(null);
    stopScan();
  }, [stopScan]);

  return (
    <main className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-hunt-bg text-center">
      <header className="shrink-0 px-hunt-screen pt-[48px]">
        <h1 className="font-black text-balance text-hunt-h1 tracking-hunt-h1 text-hunt-text-heading">
          {greeting}
        </h1>
        <p className="mx-hunt-subhead-inline mt-hunt-tight text-pretty text-base font-normal leading-relaxed text-hunt-text-subhead">
          Find plant markers in the galleries and scan them with your camera.
        </p>
      </header>

      <div className="mt-hunt-stack min-h-0 flex-1 overflow-y-auto bg-hunt-bg px-hunt-screen py-hunt-gap">
        <ul
          className="mx-auto grid w-full max-w-md grid-cols-2 justify-items-center gap-hunt-gap"
          role="list"
        >
          {HUNT_PLANT_TILES.map((plant) => {
            const showSticker = plantsWithHomeSticker.has(plant.id);
            const stickerSrc = HUNT_PLANT_FOUND_MEDIA[plant.id].stickerSrc;
            return (
              <li key={plant.id} className="w-full max-w-[length:var(--size-hunt-plant-tile)]">
                <button
                  type="button"
                  className="relative aspect-square w-full overflow-visible rounded-full transition-hunt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hunt-bg"
                  aria-label={plant.label}
                  onClick={() => setFoundPlant(plant.id)}
                >
                  <span className="pointer-events-none absolute inset-0 block overflow-hidden rounded-full">
                    <img src={plant.src} alt="" className="h-full w-full object-contain" />
                  </span>
                  {showSticker ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute right-0 top-0 z-20 block h-auto w-[38%] max-w-[5.75rem] min-w-[4.25rem] origin-top-right translate-x-[calc(20%+var(--spacing-hunt-gap)-var(--spacing-hunt-stack))] translate-y-[calc(2*var(--spacing-hunt-gap)-2*var(--spacing-hunt-stack)-10%)] rotate-[-15deg]"
                    >
                      <img
                        src={stickerSrc}
                        alt=""
                        className="found-sticker-pop h-auto w-full select-none"
                        decoding="async"
                      />
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex w-full shrink-0 flex-col px-hunt-screen pb-hunt-screen pt-hunt-gap">
        <div className="mx-auto w-full max-w-md">
          <HuntPrimaryButton type="button" onClick={startScan}>
            Scan
          </HuntPrimaryButton>
        </div>
        {cameraError ? (
          <p className="mt-hunt-tight text-pretty text-sm text-hunt-text-soft" role="alert">
            {cameraError}
          </p>
        ) : null}
      </div>

      {scanOpen ? (
        <div
          className="absolute inset-0 z-[300] flex flex-col overflow-hidden rounded-[length:var(--radius-device-shell)] bg-black"
          role="dialog"
          aria-modal="true"
          aria-label="Camera preview"
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            playsInline
            muted
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-hunt-screen pt-hunt-gap">
            <div className="pointer-events-auto mx-auto w-full max-w-md">
              <HuntPrimaryButton type="button" onClick={stopScan}>
                Close camera
              </HuntPrimaryButton>
            </div>
          </div>
        </div>
      ) : null}

      <PlantFoundSheet
        plantId={foundPlant}
        open={foundPlant !== null}
        onDismiss={(id) => {
          rememberHomeSticker(id);
          setFoundPlant(null);
        }}
        onAddToCollection={handleAddToCollection}
      />
    </main>
  );
}
