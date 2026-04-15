import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, Home, ArrowRight, Trophy } from "lucide-react";
import {
  getDepartmentById,
  markDepartmentAsCleared,
  getClearedDepartments,
  getTotalDepartments,
  isAllDepartmentsCleared,
} from "../data/departments-data";
import { useBgm } from "../context/BgmContext";

export default function DepartmentComplete() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const department = getDepartmentById(departmentId || "");
  const [showConfetti, setShowConfetti] = useState(false);
  const [clearedCount, setClearedCount] = useState(0);
  const [allCleared, setAllCleared] = useState(false);
  const totalDepartments = getTotalDepartments();
  const { switchTrack, currentTrack } = useBgm();

  useEffect(() => {
    // バトルから引き継ぎ済みでなければ勝利BGMに切り替え
    if (currentTrack !== "victory") {
      switchTrack("victory");
    }
  }, []);

  useEffect(() => {
    if (departmentId) {
      markDepartmentAsCleared(departmentId);
    }
    setShowConfetti(true);
    // markDepartmentAsCleared 後のクリア数を反映
    setClearedCount(getClearedDepartments().length);
    setAllCleared(isAllDepartmentsCleared());

    // スクリーンショット防止
    const preventScreenshot = (e: KeyboardEvent) => {
      // PrintScreen キーの検出
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        alert('スクリーンショットではなく、実際の画面を受付で提示してください');
      }
    };

    document.addEventListener('keyup', preventScreenshot);

    return () => {
      document.removeEventListener('keyup', preventScreenshot);
    };
  }, [departmentId]);

  if (!department) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>ページが見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/select")}>
              学部選択に戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { from: string; to: string; bg: string }> = {
      blue: { from: "from-blue-100", to: "to-blue-50", bg: "bg-blue-600" },
      green: { from: "from-green-100", to: "to-green-50", bg: "bg-green-600" },
      purple: { from: "from-purple-100", to: "to-purple-50", bg: "bg-purple-600" },
      yellow: { from: "from-yellow-100", to: "to-yellow-50", bg: "bg-yellow-600" },
      orange: { from: "from-orange-100", to: "to-orange-50", bg: "bg-orange-600" },
      pink: { from: "from-pink-100", to: "to-pink-50", bg: "bg-pink-600" },
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(department.color);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 紙吹雪エフェクト */}
      {showConfetti && (
        <>
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-[fall_3s_linear_infinite] opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 3}s`,
                fontSize: `${20 + Math.random() * 20}px`,
              }}
            >
              {["🎉", "🎊", "⭐", "✨", department.icon][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </>
      )}

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-400 rounded-full p-6 shadow-2xl animate-bounce">
              <CheckCircle2 className="w-20 h-20 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
            クリア おめでとう！
          </h1>
        </div>

        <Card className="shadow-2xl border-2 border-green-300">
          <CardHeader className={`bg-gradient-to-r ${colorClasses.from} ${colorClasses.to}`}>
            <div className="text-center space-y-2">
              <div className="text-4xl">{department.icon}</div>
              <CardTitle className="text-2xl">
                {department.name}
              </CardTitle>
              <p className="text-gray-600">{department.buildings}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <p className="text-center text-lg text-gray-800 leading-relaxed">
                すべての謎を見事に解き明かしました！<br />
                この学部の探索は完了です。
              </p>
            </div>

            {/* 進捗状況 */}
            <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-300">
              <div className="flex items-start gap-3">
                <Trophy className="w-6 h-6 text-blue-700 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-2">進捗状況</h3>
                  <p className="text-gray-800 text-lg font-semibold">
                    クリア済み: {clearedCount} / {totalDepartments} 学部
                  </p>
                  {allCleared ? (
                    <p className="text-gray-700 mt-2">
                      🎉 すべての学部をクリアしました！<br />
                      <strong>1号館エントランスの受付</strong>で景品を受け取ってください。
                    </p>
                  ) : (
                    <p className="text-gray-700 mt-2">
                      景品は<strong>すべての学部をクリア</strong>してから<br />
                      1号館受付でお渡しします。残りの学部にも挑戦しよう！
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {allCleared ? (
                <Button
                  onClick={() => navigate("/all-complete")}
                  className="w-full h-12 text-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  景品受け取り画面へ
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/select")}
                  className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  次の学部に挑戦する
                </Button>
              )}

              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full h-12 text-lg"
              >
                <Home className="w-5 h-5 mr-2" />
                ホームに戻る
              </Button>
            </div>
          </CardContent>
        </Card>

        {!allCleared && (
          <p className="text-center text-gray-600 font-semibold">
            他の学部にも挑戦して、全クリアを目指そう！
          </p>
        )}
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
