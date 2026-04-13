import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import Opening from "./components/Opening";
import { BgmProvider } from "./context/BgmContext";
import InAppBrowserGuard from "./components/InAppBrowserGuard";
import AccountSetup from "./components/AccountSetup";
import { loadUserAccount } from "./data/departments-data";

export default function App() {
  const [hasAccount, setHasAccount] = useState(() => !!loadUserAccount());
  const [showOpening, setShowOpening] = useState(true);

  if (!hasAccount) {
    return (
      <>
        <InAppBrowserGuard />
        <AccountSetup onComplete={() => setHasAccount(true)} />
      </>
    );
  }

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