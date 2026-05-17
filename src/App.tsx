import { IPhone14Frame, useDevFramedPreview } from "./components/device/IPhone14Frame";
import { MuseumFlow } from "./components/museum/MuseumFlow";

export default function App() {
  const devFramed = useDevFramedPreview();

  return (
    <div
      className={`flex min-h-dvh w-full flex-col overflow-x-hidden supports-[min-height:100dvh]:min-h-[100dvh] ${
        devFramed
          ? "items-center justify-center p-hunt-screen"
          : "sm:items-center sm:justify-center sm:p-hunt-screen"
      }`}
    >
      <IPhone14Frame>
        <MuseumFlow />
      </IPhone14Frame>
    </div>
  );
}
