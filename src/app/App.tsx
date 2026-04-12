import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import Opening from "./components/Opening";
import { BgmProvider } from "./context/BgmContext";
import InAppBrowserGuard from "./components/InAppBrowserGuard";

export default function App() {
  const [showOpening, setShowOpening] = useState(true);

  if (showOpening) {
    return (
      <>
        <InAppBrowserGuard />
        <Opening onComplete={() => setShowOpening(false)} />
      </>
    );
  }

  return (
    <BgmProvider>
      <InAppBrowserGuard />
      <RouterProvider router={router} />
    </BgmProvider>
  );
}