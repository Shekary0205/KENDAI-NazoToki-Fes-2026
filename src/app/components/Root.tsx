import { Outlet, useLocation } from "react-router";
import ScrollToTop from "./ScrollToTop";
import { Button } from "./ui/button";
import { Music } from "lucide-react";
import { useBgm } from "../context/BgmContext";
import { saveGameProgress } from "../data/departments-data";
import { useEffect } from "react";

export default function Root() {
  const { isPlaying, toggleBgm } = useBgm();
  const location = useLocation();

  // 画面遷移のたびに自動保存
  useEffect(() => {
    // ホーム画面と学部選択画面では保存しない
    if (location.pathname !== "/" && location.pathname !== "/select") {
      saveGameProgress(location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen">
      <ScrollToTop />
      <Outlet />

      {/* グローバルBGMコントロール */}
      <div className="w-full pt-2 pb-6 text-center space-y-1">
        <p className="text-xs text-gray-500">↓こんなところにBGMが！↓</p>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleBgm}
          className="text-xs h-8 px-3"
        >
          <Music className="w-3 h-3 mr-1" />
          {isPlaying ? "BGM停止" : "BGM再生"}
        </Button>
      </div>
    </div>
  );
}
