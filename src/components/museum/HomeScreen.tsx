import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import { HUNT_PLANT_FOUND_MEDIA } from "../../tokens/huntPlantFoundMedia";
import { HUNT_PLANT_TILES, type HuntPlantId } from "../../tokens/huntPlantTiles";
import { HuntPrimaryButton } from "./HuntPrimaryButton";
import { PlantFoundSheet } from "./PlantFoundSheet";

type HomeScreenProps = {
  foragerName: string;
};

const COLLECTED_STORAGE_KEY = "bushfood-collected";
const QR_SCANNER_ELEMENT_ID = "bushfood-qr-reader";

const CAMERA_TRY_ORDER: MediaTrackConstraints[] = [
  { facingMode: { ideal: "environment" } },
  { facingMode: "user" },
  {},
];

function waitNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function formatMediaOrScannerError(err: unknown): string {
  if (typeof DOMException !== "undefined" && err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      return "Camera permission was denied. Allow camera access in your browser settings to scan.";
    }
    if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      return "No camera was found on this device.";
    }
    if (err.name === "NotReadableError" || err.name === "TrackStartError") {
      return "The camera is in use by another app or could not be started.";
    }
    if (err.name === "OverconstrainedError") {
      return "This camera does not support the requested settings.";
    }
    const msg = err.message?.trim();
    return msg ? msg : err.name;
  }
  if (err instanceof Error) {
    const msg = err.message?.trim();
    return msg ? msg : "Could not access the camera.";
  }
  if (typeof err === "string" && err.trim()) return err.trim();
  return "Could not access the camera.";
}

async function pickPreferredQrCameraDeviceId(): Promise<string | null> {
  try {
    const devices = await Html5Qrcode.getCameras();
    const first = devices[0];
    if (first == null) return null;
    const preferBack = devices.find((d) => /back|rear|environment|wide/i.test(d.label));
    return (preferBack ?? first).id;
  } catch {
    return null;
  }
}

const VALID_QR_PLANT_IDS = new Set<HuntPlantId>(HUNT_PLANT_TILES.map((t) => t.id));

function loadCollectedPlantsFromStorage(): Set<HuntPlantId> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(COLLECTED_STORAGE_KEY);
    if (raw == null || raw === "") return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    const next = new Set<HuntPlantId>();
    for (const item of parsed) {
      if (typeof item === "string" && VALID_QR_PLANT_IDS.has(item as HuntPlantId)) {
        next.add(item as HuntPlantId);
      }
    }
    return next;
  } catch {
    return new Set();
  }
}

function parsePlantIdFromDecodedQr(text: string): HuntPlantId | null {
  const trimmed = text.trim();
  if (VALID_QR_PLANT_IDS.has(trimmed as HuntPlantId)) {
    return trimmed as HuntPlantId;
  }
  try {
    const url = new URL(trimmed);
    const lastSegment = url.pathname.split("/").filter(Boolean).pop();
    if (lastSegment != null && VALID_QR_PLANT_IDS.has(lastSegment as HuntPlantId)) {
      return lastSegment as HuntPlantId;
    }
  } catch {
    // not a valid URL
  }
  return null;
}

/**
 * Post-welcome homescreen — plant grid + scan action (Figma `2_Homescreen`).
 * PlantFoundSheet opens only after a valid museum QR scan (Html5Qrcode). Tiles are decorative;
 * stickers reflect plants added to the collection (localStorage `bushfood-collected`).
 */
export function HomeScreen({ foragerName }: HomeScreenProps) {
  const greeting = foragerName.trim() ? `Hi ${foragerName.trim()}` : "Hi there";
  const matchedThisSessionRef = useRef(false);
  const foundPlantRef = useRef<HuntPlantId | null>(null);
  /** Serialize Html5Qrcode start/stop so Strict Mode + rapid open/close cannot overlap on the same DOM id. */
  const scanCameraChainRef = useRef(Promise.resolve());
  const activeQrScannerRef = useRef<Html5Qrcode | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [foundPlant, setFoundPlant] = useState<HuntPlantId | null>(null);
  const [collectedPlants, setCollectedPlants] = useState<Set<HuntPlantId>>(loadCollectedPlantsFromStorage);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    foundPlantRef.current = foundPlant;
  }, [foundPlant]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(COLLECTED_STORAGE_KEY, JSON.stringify([...collectedPlants]));
    } catch {
      // ignore quota / private mode
    }
  }, [collectedPlants]);

  const stopScan = useCallback(() => {
    setScanOpen(false);
    setCameraError(null);
  }, []);

  const startScan = useCallback(() => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported in this browser.");
      return;
    }
    // Request camera while we still have a user gesture (Safari / some WebKit builds
    // block getUserMedia if it runs only after async effect + paint delays).
    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        stream.getTracks().forEach((t) => t.stop());
      } catch (err) {
        setCameraError(formatMediaOrScannerError(err));
        return;
      }
      setScanOpen(true);
    })();
  }, []);

  useEffect(() => {
    if (!scanOpen) return;

    let effectCancelled = false;
    matchedThisSessionRef.current = false;

    const stopScannerIfRunning = async (scanner: Html5Qrcode) => {
      try {
        const state = scanner.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scanner.stop();
        }
      } catch {
        // already stopped or not started
      }
    };

    const run = scanCameraChainRef.current
      .catch(() => {
        // keep chain alive after a failed stop/start
      })
      .then(async () => {
        await waitNextPaint();
        if (effectCancelled) return;

        const scanner = new Html5Qrcode(QR_SCANNER_ELEMENT_ID);
        activeQrScannerRef.current = scanner;

        const qrConfig = {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const m = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.max(120, Math.min(Math.floor(m * 0.72), 300));
            return { width: edge, height: edge };
          },
        } as const;

        const onDecode = (decodedText: string) => {
          if (effectCancelled || matchedThisSessionRef.current) return;
          const id = parsePlantIdFromDecodedQr(decodedText);
          if (id == null) return;
          matchedThisSessionRef.current = true;
          void (async () => {
            activeQrScannerRef.current = null;
            await stopScannerIfRunning(scanner);
            if (effectCancelled) return;
            setScanOpen(false);
            setFoundPlant(id);
          })();
        };

        let lastError: unknown;
        let started = false;

        if (!effectCancelled) {
          const deviceId = await pickPreferredQrCameraDeviceId();
          if (deviceId != null) {
            try {
              await scanner.start(deviceId, qrConfig, onDecode, () => {
                /* no QR in frame */
              });
              started = true;
            } catch (e) {
              lastError = e;
              await stopScannerIfRunning(scanner);
            }
          }
        }

        for (const constraints of CAMERA_TRY_ORDER) {
          if (started || effectCancelled) break;
          try {
            await scanner.start(constraints, qrConfig, onDecode, () => {
              /* no QR in frame */
            });
            started = true;
            break;
          } catch (e) {
            lastError = e;
            await stopScannerIfRunning(scanner);
          }
        }

        if (!started) {
          activeQrScannerRef.current = null;
          if (!effectCancelled) {
            setCameraError(formatMediaOrScannerError(lastError));
            setScanOpen(false);
          }
        }
      });

    scanCameraChainRef.current = run.catch(() => {});

    return () => {
      effectCancelled = true;
      matchedThisSessionRef.current = false;
      scanCameraChainRef.current = scanCameraChainRef.current.then(async () => {
        const s = activeQrScannerRef.current;
        activeQrScannerRef.current = null;
        if (s) await stopScannerIfRunning(s);
      });
    };
  }, [scanOpen]);

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
    const id = foundPlantRef.current;
    if (id != null) {
      setCollectedPlants((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
    setFoundPlant(null);
    setScanOpen(false);
  }, []);

  return (
    <main className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden bg-hunt-bg text-center">
      <header className="shrink-0 px-hunt-screen pt-[48px]">
        <h1 className="font-black text-balance text-hunt-h1 tracking-hunt-h1 text-hunt-text-heading">
          {greeting}
        </h1>
        <p className="mx-auto mt-hunt-tight max-w-full text-pretty text-base font-normal leading-relaxed text-hunt-text-subhead sm:mx-hunt-subhead-inline">
          Find plant markers in the galleries and scan them with your camera.
        </p>
      </header>

      <div className="mt-hunt-stack min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-hunt-bg px-hunt-screen py-hunt-gap">
        <ul
          className="mx-auto grid w-full min-w-0 max-w-md grid-cols-2 justify-items-stretch gap-hunt-gap"
          role="list"
        >
          {HUNT_PLANT_TILES.map((plant) => {
            const showSticker = collectedPlants.has(plant.id);
            const stickerSrc = HUNT_PLANT_FOUND_MEDIA[plant.id].stickerSrc;
            return (
              <li key={plant.id} className="min-w-0 w-full">
                <div
                  role="img"
                  aria-label={plant.label}
                  className="relative mx-auto aspect-square w-full max-w-[min(100%,var(--size-hunt-plant-tile))] overflow-visible rounded-full transition-hunt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hunt-bg"
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
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex w-full min-w-0 shrink-0 flex-col px-hunt-screen pb-hunt-screen pt-hunt-gap">
        <div className="mx-auto w-full min-w-0 max-w-md">
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
          className="absolute inset-0 z-[300] flex flex-col overflow-x-hidden overflow-y-hidden rounded-[length:var(--radius-device-shell)] bg-black"
          role="dialog"
          aria-modal="true"
          aria-label="Camera preview"
        >
          <div
            id={QR_SCANNER_ELEMENT_ID}
            className="absolute inset-0 h-full w-full object-cover"
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
        onDismiss={() => {
          setFoundPlant(null);
        }}
        onAddToCollection={handleAddToCollection}
      />
    </main>
  );
}
