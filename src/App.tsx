import { IPhone14Frame } from "./components/device/IPhone14Frame";
import { MuseumFlow } from "./components/museum/MuseumFlow";

export default function App() {
  return (
    <div className="flex min-h-dvh w-full flex-col overflow-x-hidden bg-hunt-chrome supports-[min-height:100dvh]:min-h-[100dvh] sm:items-center sm:justify-center sm:p-hunt-screen">
      <IPhone14Frame>
        <MuseumFlow />
      </IPhone14Frame>
    </div>
  );
}
