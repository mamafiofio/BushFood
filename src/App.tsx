import { IPhone14Frame } from "./components/device/IPhone14Frame";
import { WelcomeScreen } from "./components/museum/WelcomeScreen";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hunt-chrome p-hunt-screen">
      <IPhone14Frame>
        <WelcomeScreen />
      </IPhone14Frame>
    </div>
  );
}
