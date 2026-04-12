import { Outlet, useLocation } from "react-router";
import ScrollToTop from "./ScrollToTop";
import { Button } from "./ui/button";
import { Music, Save } from "lucide-react";
import { useBgm } from "../context/BgmContext";
import { saveGameProgress } from "../data/departments-data";
import { useState } from "react";

export default function Root() {
  const { isPlaying, toggleBgm } = useBgm();
  const location = useLocation();
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    saveGameProgress(location.pathname);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div className="relative min-h-screen">
      <ScrollToTop />

      {/* 右上固定の保存ボタン */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="bg-white/90 backdrop-blur shadow-md text-xs h-9 px-3"
        >
          <Save className="w-4 h-4 mr-1" />
          {showSaved ? "保存しました！" : "経過保存"}
        </Button>
      </div>

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
