import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import Opening from "./components/Opening";
import { BgmProvider } from "./context/BgmContext";

export default function App() {
  const [showOpening, setShowOpening] = useState(true);

  if (showOpening) {
    return <Opening onComplete={() => setShowOpening(false)} />;
  }

  return (
    <BgmProvider>
      <RouterProvider router={router} />
    </BgmProvider>
  );
}