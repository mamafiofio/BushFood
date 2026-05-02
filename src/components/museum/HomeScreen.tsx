import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HUNT_PLANT_TILES } from "../../tokens/huntPlantTiles";
import { HuntPrimaryButton } from "./HuntPrimaryButton";
import { WattleseedFoundSheet } from "./WattleseedFoundSheet";

type HomeScreenProps = {
  foragerName: string;
};

/**
 * Post-welcome homescreen — plant grid + scan action (Figma `2_Homescreen`).
 * Wattleseed info sheet opens from the wattleseed tile (wireframe `4_Success camera scan screen` in Native-plants); camera marker flow is deferred.
 * Camera: `getUserMedia` on desktop (webcam) and mobile; `facingMode: environment` prefers rear camera when available.
 */
export function HomeScreen({ foragerName }: HomeScreenProps) {
  const greeting = foragerName.trim() ? `Hi ${foragerName.trim()}` : "Hi there";
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [wattleseedOpen, setWattleseedOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopScan = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanOpen(false);
    setWattleseedOpen(false);
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
    if (!scanOpen && !wattleseedOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (wattleseedOpen) {
        setWattleseedOpen(false);
      } else {
        stopScan();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [scanOpen, wattleseedOpen, stopScan]);

  const handleAddToCollection = useCallback(() => {
    setWattleseedOpen(false);
    stopScan();
  }, [stopScan]);

  const openWattleseedInfo = useCallback(() => {
    setWattleseedOpen(true);
  }, []);

  return (
    <main className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-hunt-bg text-center">
      <header className="shrink-0 px-hunt-screen pt-[48px]">
        <h2 className="font-black text-balance text-hunt-h1 tracking-tight text-hunt-text-heading">
          {greeting}
        </h2>
        <p className="mx-hunt-subhead-inline mt-hunt-tight text-pretty text-base font-normal leading-relaxed text-hunt-text-subhead">
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
                onClick={plant.id === "wattleseed" ? openWattleseedInfo : undefined}
              >
                <img src={plant.src} alt="" className="h-full w-full object-contain" />
              </button>
            </li>
          ))}
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

      {scanOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[300] flex flex-col bg-black"
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
            </div>,
            document.body,
          )
        : null}

      <WattleseedFoundSheet
        open={wattleseedOpen}
        onDismiss={() => setWattleseedOpen(false)}
        onAddToCollection={handleAddToCollection}
      />
    </main>
  );
}
