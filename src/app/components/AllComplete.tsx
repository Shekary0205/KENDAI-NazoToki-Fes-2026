import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Trophy, Star, Home, RotateCcw, Gift } from "lucide-react";
import { departments, isAllDepartmentsCleared, resetProgress } from "../data/departments-data";
import { useBgm } from "../context/BgmContext";

export default function AllComplete() {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentTime] = useState(new Date().toLocaleString('ja-JP'));
  const { switchTrack, currentTrack } = useBgm();

  useEffect(() => {
    if (currentTrack !== "victory") {
      switchTrack("victory");
    }
  }, []);

  useEffect(() => {
    // 全クリアしていない場合は学部選択に戻す
    if (!isAllDepartmentsCleared()) {
      navigate("/select");
      return;
    }

    setShowConfetti(true);

    // スクリーンショット防止
    const preventScreenshot = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        alert('スクリーンショットではなく、実際の画面を受付で提示してください');
      }
    };

    // 右クリック防止
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('keyup', preventScreenshot);
    document.addEventListener('contextmenu', preventContextMenu);
    
    return () => {
      document.removeEventListener('keyup', preventScreenshot);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [navigate]);

  const handleReset = () => {
    if (window.confirm('進行状況をリセットして、最初からやり直しますか？')) {
      resetProgress();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 紙吹雪エフェクト */}
      {showConfetti && (
        <>
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-[fall_4s_linear_infinite] opacity-90"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 4}s`,
                fontSize: `${25 + Math.random() * 25}px`,
              }}
            >
              {["🎉", "🎊", "⭐", "🌟", "✨", "🏆", "👏"][Math.floor(Math.random() * 7)]}
            </div>
          ))}
        </>
      )}

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-8 shadow-2xl animate-bounce">
              <Trophy className="w-24 h-24 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600">
            完全制覇！
          </h1>
          <div className="flex justify-center gap-2">
            <Star className="w-10 h-10 text-yellow-500 fill-yellow-500 animate-pulse" />
            <Star className="w-10 h-10 text-yellow-500 fill-yellow-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <Star className="w-10 h-10 text-yellow-500 fill-yellow-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        <Card className="shadow-2xl border-4 border-yellow-400">
          <CardHeader className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100">
            <CardTitle className="text-3xl text-center">
              🎊 全学部クリア達成！ 🎊
            </CardTitle>
            <p className="text-center text-gray-700 text-lg mt-2">
              KENDAI謎解きフェス2026
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-300">
              <p className="text-center text-xl text-gray-800 leading-relaxed font-semibold">
                全6学部の謎を見事に解き明かし、<br />
                学内探索を完全制覇しました！
              </p>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-lg border-2 border-gray-300">
              <h3 className="font-bold text-center text-gray-800 text-lg mb-4">
                ✅ クリアした学部
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="bg-green-50 border-2 border-green-300 rounded-lg px-3 py-3 text-center"
                  >
                    <div className="text-2xl mb-1">{dept.icon}</div>
                    <div className="text-xs font-semibold text-green-800">
                      {dept.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-100 to-orange-100 p-6 rounded-lg border-3 border-red-300 shadow-lg">
              <div className="flex items-start gap-3">
                <Gift className="w-8 h-8 text-red-700 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-900 text-xl mb-2">豪華景品をゲット！</h3>
                  <p className="text-gray-800 font-semibold mb-2">
                    <strong className="text-lg">1号館エントランスの受付</strong>で<br />
                    この画面を提示して景品を受け取ってください
                  </p>
                  <div className="bg-white/70 p-3 rounded mt-3 text-sm text-gray-700">
                    <p className="font-mono">達成日時: {currentTime}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
              <p className="text-sm text-red-900 text-center font-bold">
                ⚠️ スクリーンショットは無効です<br />
                必ず実際の画面を受付で提示してください
              </p>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
              <p className="text-center text-gray-700 leading-relaxed">
                これからの大学生活でも、<br />
                今日のような好奇心と探究心を持って<br />
                様々なことにチャレンジしてください！
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/")}
                className="w-full h-12 text-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <Home className="w-5 h-5 mr-2" />
                ホームに戻る
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full h-12 text-lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                最初から挑戦し直す
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-700 font-bold text-lg">
          🎓 ようこそ、高崎健康福祉大学へ！ 🎓
        </p>
      </div>

      <style>{`
        @keyframes fall {
          from {
            transform: translateY(-100vh) rotate(0deg);
          }
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
