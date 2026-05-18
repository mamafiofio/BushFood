import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import kangarooGrassLottie from "../../assets/native-plants/lottie/KangarooGrass.json";
import wattleseedLottie from "../../assets/native-plants/lottie/Wattleseed.json";
import { HUNT_PLANT_FOUND_MEDIA } from "../../tokens/huntPlantFoundMedia";
import { HUNT_PLANT_TILES, type HuntPlantId } from "../../tokens/huntPlantTiles";
import { HuntPrimaryButton } from "./HuntPrimaryButton";
import { PlantFoundSheet } from "./PlantFoundSheet";
import { ScanCameraOverlay } from "./ScanCameraOverlay";

type HomeScreenProps = {
  foragerName: string;
  /** True when the homescreen is the visible phase (welcome → home). */
  isActive?: boolean;
};

const COLLECTED_STORAGE_KEY = "bushfood-collected";
const QR_SCANNER_ELEMENT_ID = "bushfood-qr-reader";
const HOME_LOTTIE_GAP_MS = 5000;

/** Matches homescreen entrance tokens in index.css (`hunt-home-screen--enter`, `hunt-plant-tile-enter`). */
const HOME_INTRO_TITLE_STAGGER_MS = 50;
const HOME_INTRO_TITLE_DURATION_MS = 420;
const HOME_INTRO_REVEAL_STAGGER_MS = 90;
const HOME_INTRO_REVEAL_DURATION_MS = 280;
const HOME_PLANT_TILE_STAGGER_MS = 100;
const HOME_PLANT_TILE_DURATION_MS = 480;

function computeHomeIntroEndMs(titleLetterCount: number, introLineCount: number): number {
  const titleEndMs =
    (titleLetterCount - 1) * HOME_INTRO_TITLE_STAGGER_MS + HOME_INTRO_TITLE_DURATION_MS;
  const introEndMs =
    titleEndMs + (introLineCount - 1) * HOME_INTRO_REVEAL_STAGGER_MS + HOME_INTRO_REVEAL_DURATION_MS;
  const lastPlantEnterIndex = HUNT_PLANT_TILES.length - 1;
  return introEndMs + lastPlantEnterIndex * HOME_PLANT_TILE_STAGGER_MS + HOME_PLANT_TILE_DURATION_MS;
}

function HomePlantLottieIcon({
  animationData,
  lottieRef,
}: {
  animationData: typeof wattleseedLottie | typeof kangarooGrassLottie;
  lottieRef: RefObject<LottieRefCurrentProps | null>;
}) {
  const handleReady = useCallback(() => {
    lottieRef.current?.goToAndStop(0, true);
  }, [lottieRef]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={false}
      autoplay={false}
      onDOMLoaded={handleReady}
      className="h-full w-full"
    />
  );
}

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

const HOME_INTRO_LINES = [
  "Find plant markers in",
  "the galleries and scan them",
  "with your camera.",
] as const;

function HomeGreeting({ greeting, animated }: { greeting: string; animated: boolean }) {
  if (!animated) {
    return (
      <h1 className="font-black text-balance text-hunt-h1 tracking-hunt-h1 text-hunt-text-heading">
        {greeting}
      </h1>
    );
  }

  return (
    <h1 className="font-black text-balance text-hunt-h1 tracking-hunt-h1 text-hunt-text-heading">
      <span className="sr-only">{greeting}</span>
      <span aria-hidden className="welcome-title-visual">
        {[...greeting].map((char, charIndex) => (
          <span
            key={charIndex}
            className="welcome-title-letter"
            style={{ "--welcome-letter-index": charIndex } as CSSProperties}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </h1>
  );
}

function getScanViewportAspectRatio(readerElementId: string): number | undefined {
  const el = document.getElementById(readerElementId);
  if (el == null) return undefined;
  const { clientWidth: w, clientHeight: h } = el;
  if (w <= 0 || h <= 0) return undefined;
  return w / h;
}

/**
 * Post-welcome homescreen — plant grid + scan action (Figma `2_Homescreen`).
 * PlantFoundSheet opens only after a valid museum QR scan (Html5Qrcode). Tiles are decorative;
 * stickers reflect plants added via QR scan + “Add to collection” (this session only).
 */
export function HomeScreen({ foragerName, isActive = false }: HomeScreenProps) {
  const greeting = foragerName.trim() ? `Hi ${foragerName.trim()}` : "Hi forager";
  const matchedThisSessionRef = useRef(false);
  const foundPlantRef = useRef<HuntPlantId | null>(null);
  /** Serialize Html5Qrcode start/stop so Strict Mode + rapid open/close cannot overlap on the same DOM id. */
  const scanCameraChainRef = useRef(Promise.resolve());
  const activeQrScannerRef = useRef<Html5Qrcode | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [foundPlant, setFoundPlant] = useState<HuntPlantId | null>(null);
  const [collectedPlants, setCollectedPlants] = useState<Set<HuntPlantId>>(() => new Set());
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

        const aspectRatio = getScanViewportAspectRatio(QR_SCANNER_ELEMENT_ID);
        const qrConfig = {
          fps: 10,
          ...(aspectRatio != null ? { aspectRatio } : {}),
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

  const addPlantToCollection = useCallback((id: HuntPlantId) => {
    setCollectedPlants((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleAddToCollection = useCallback(() => {
    const id = foundPlantRef.current;
    if (id != null) {
      addPlantToCollection(id);
    }
    setFoundPlant(null);
    setScanOpen(false);
  }, [addPlantToCollection]);

  const handleDismissFound = useCallback(
    (id: HuntPlantId | null) => {
      if (id != null) {
        addPlantToCollection(id);
      }
      setFoundPlant(null);
    },
    [addPlantToCollection],
  );

  const showHeaderEntrance = isActive;
  const showPlantEntrance = showHeaderEntrance;
  const homeEntranceStyle = {
    "--welcome-title-letter-count": [...greeting].length,
    "--welcome-intro-line-count": HOME_INTRO_LINES.length,
  } as CSSProperties;
  const wattleseedLottieRef = useRef<LottieRefCurrentProps>(null);
  const kangarooGrassLottieRef = useRef<LottieRefCurrentProps>(null);
  const leftColumnPlants = HUNT_PLANT_TILES.filter((_, index) => index % 2 === 0);
  const rightColumnPlants = HUNT_PLANT_TILES.filter((_, index) => index % 2 === 1);

  useEffect(() => {
    if (!isActive) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      wattleseedLottieRef.current?.goToAndStop(0, true);
      kangarooGrassLottieRef.current?.goToAndStop(0, true);
      return;
    }

    const introEndMs = computeHomeIntroEndMs([...greeting].length, HOME_INTRO_LINES.length);
    const firstPlayMs = introEndMs + HOME_LOTTIE_GAP_MS;
    let cancelled = false;
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let nextPlant: HuntPlantId = "wattleseed";

    const playPlant = (plantId: HuntPlantId) => {
      const lottie =
        plantId === "wattleseed" ? wattleseedLottieRef.current : kangarooGrassLottieRef.current;
      lottie?.goToAndPlay(0, true);
    };

    const scheduleNext = (delayMs: number) => {
      const timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        playPlant(nextPlant);
        nextPlant = nextPlant === "wattleseed" ? "kangaroo-grass" : "wattleseed";
        scheduleNext(HOME_LOTTIE_GAP_MS);
      }, delayMs);
      timeoutIds.push(timeoutId);
    };

    scheduleNext(firstPlayMs);

    return () => {
      cancelled = true;
      for (const timeoutId of timeoutIds) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isActive, greeting]);

  function renderPlantTile(
    plant: (typeof HUNT_PLANT_TILES)[number],
    revealIndex: number,
    column: "left" | "right",
  ) {
    const showSticker = collectedPlants.has(plant.id);
    const stickerSrc = HUNT_PLANT_FOUND_MEDIA[plant.id].stickerSrc;
    const tileEnterStyle = {
      "--hunt-plant-tile-enter-index": revealIndex,
    } as CSSProperties;

    return (
      <li
        key={plant.id}
        className={`relative isolate min-w-0 w-full ${showSticker ? "z-10" : "z-0"}`}
      >
        <div
          role="img"
          aria-label={plant.label}
          style={showPlantEntrance ? tileEnterStyle : undefined}
          className={`relative mx-auto aspect-square w-full max-w-[min(100%,var(--size-hunt-plant-tile))] overflow-visible rounded-full transition-hunt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hunt-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hunt-bg${showPlantEntrance ? " hunt-plant-tile-enter" : ""}`}
        >
          <span className="pointer-events-none absolute inset-0 block overflow-hidden rounded-full">
            {plant.id === "wattleseed" ? (
              <HomePlantLottieIcon animationData={wattleseedLottie} lottieRef={wattleseedLottieRef} />
            ) : plant.id === "kangaroo-grass" ? (
              <HomePlantLottieIcon
                animationData={kangarooGrassLottie}
                lottieRef={kangarooGrassLottieRef}
              />
            ) : (
              <img src={plant.src} alt="" className="h-full w-full object-contain" draggable={false} />
            )}
          </span>
          {showSticker ? (
            <span
              aria-hidden
              className={`pointer-events-none absolute right-0 top-0 z-10 block h-auto w-[38%] max-w-[5.75rem] min-w-[4.25rem] origin-top-right rotate-[-15deg]${column === "right" ? " translate-x-[calc(8%-var(--spacing-hunt-stack)+15px)] -translate-y-[calc(8%+20px)]" : " translate-x-[calc(8%+var(--spacing-hunt-stack))] -translate-y-[8%]"}`}
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
  }

  return (
    <main className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden bg-transparent text-center">
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-hunt-screen">
        <div
          className={showHeaderEntrance ? "hunt-home-screen--enter" : undefined}
          style={showHeaderEntrance ? homeEntranceStyle : undefined}
        >
          <header className="pt-[length:var(--spacing-hunt-welcome-title-pt)]">
            <HomeGreeting greeting={greeting} animated={showHeaderEntrance} />
          <p className="mx-auto mt-hunt-tight max-w-full text-pretty text-base font-normal leading-relaxed text-hunt-text-subhead sm:mx-hunt-subhead-inline">
            {showHeaderEntrance
              ? HOME_INTRO_LINES.map((line, index) => (
                  <span
                    key={line}
                    className="welcome-screen-intro-line block"
                    style={{ "--welcome-intro-line-index": index } as CSSProperties}
                  >
                    {line}
                  </span>
                ))
              : "Find plant markers in the galleries and scan them with your camera."}
          </p>
        </header>

        <div
          className={`mx-auto mt-hunt-stack grid w-full min-w-0 max-w-md grid-cols-2 items-start gap-x-hunt-gap pb-hunt-gap${showPlantEntrance ? " hunt-plant-grid--enter" : ""}`}
          role="presentation"
        >
          <ul className="flex min-w-0 flex-col gap-hunt-gap" role="list">
            {leftColumnPlants.map((plant, columnIndex) =>
              renderPlantTile(plant, columnIndex * 2, "left"),
            )}
          </ul>
          <ul
            className="flex min-w-0 flex-col gap-hunt-gap pt-[calc(var(--size-hunt-plant-tile)/2)]"
            role="list"
          >
            {rightColumnPlants.map((plant, columnIndex) =>
              renderPlantTile(plant, columnIndex * 2 + 1, "right"),
            )}
          </ul>
        </div>
        </div>
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
        <ScanCameraOverlay readerId={QR_SCANNER_ELEMENT_ID} onClose={stopScan} />
      ) : null}

      <PlantFoundSheet
        plantId={foundPlant}
        open={foundPlant !== null}
        onDismiss={handleDismissFound}
        onAddToCollection={handleAddToCollection}
      />
    </main>
  );
}
