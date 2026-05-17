import { HuntPrimaryButton } from "./HuntPrimaryButton";

type ScanCameraOverlayProps = {
  readerId: string;
  onClose: () => void;
};

/**
 * Full-screen QR camera layer (html5-qrcode mounts into `readerId`).
 * Kept separate from HomeScreen so the homescreen layout stays unchanged.
 */
export function ScanCameraOverlay({ readerId, onClose }: ScanCameraOverlayProps) {
  return (
    <div
      className="bushfood-scan-overlay absolute inset-0 z-[300] flex flex-col overflow-hidden bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Camera preview"
    >
      <div id={readerId} className="bushfood-scan-reader absolute inset-0 size-full min-h-0 min-w-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-hunt-screen pt-hunt-gap">
        <div className="pointer-events-auto mx-auto w-full max-w-md">
          <HuntPrimaryButton type="button" onClick={onClose}>
            Close camera
          </HuntPrimaryButton>
        </div>
      </div>
    </div>
  );
}
