import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import Opening from "./components/Opening";
import { BgmProvider } from "./context/BgmContext";
import InAppBrowserGuard from "./components/InAppBrowserGuard";
import AccountSetup from "./components/AccountSetup";
import { loadUserAccount, getClearedDepartments, restoreStateSnapshot } from "./data/departments-data";
import { registerAccountToServer, recordClearedDepartmentToServer } from "./utils/supabase";

export default function App() {
  const [hasAccount, setHasAccount] = useState(() => !!loadUserAccount());
  const [showOpening, setShowOpening] = useState(true);

  // ブラウザバック時にスナップショットから復元
  useEffect(() => {
    const handlePopState = () => {
      restoreStateSnapshot();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 既存ユーザーをサーバーに同期（1セッション1回）
  useEffect(() => {
    if (!hasAccount) return;
    if (sessionStorage.getItem("accountSyncedThisSession") === "true") return;
    const account = loadUserAccount();
    if (!account) return;
    registerAccountToServer(account.studentId, account.name).then(() => {
      sessionStorage.setItem("accountSyncedThisSession", "true");
      // 既存のクリア済み学部もサーバーに同期（重複は無視される）
      const cleared = getClearedDepartments();
      cleared.forEach(deptId => {
        void recordClearedDepartmentToServer(account.studentId, deptId);
      });
    });
  }, [hasAccount]);

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