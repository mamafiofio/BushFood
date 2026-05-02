import { IPhone14Frame } from "./components/device/IPhone14Frame";
import { MuseumFlow } from "./components/museum/MuseumFlow";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-hunt-chrome p-hunt-screen">
      <IPhone14Frame>
        <MuseumFlow />
      </IPhone14Frame>
    </div>
  );
}
