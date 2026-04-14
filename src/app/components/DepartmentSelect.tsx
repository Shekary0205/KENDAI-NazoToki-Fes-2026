import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Home, CheckCircle2, PlayCircle } from "lucide-react";
import { departments, getClearedDepartments, isAllDepartmentsCleared, loadGameProgress } from "../data/departments-data";
import { useEffect, useState } from "react";
import { useBgm } from "../context/BgmContext";

export default function DepartmentSelect() {
  const navigate = useNavigate();
  const [clearedDepts, setClearedDepts] = useState<string[]>([]);
  const [allCleared, setAllCleared] = useState(false);
  const { switchTrack } = useBgm();

  useEffect(() => {
    // 学部選択画面ではポケモンジムBGM
    switchTrack("gym");
  }, [switchTrack]);

  useEffect(() => {
    const updateClearStatus = () => {
      setClearedDepts(getClearedDepartments());
      setAllCleared(isAllDepartmentsCleared());
    };

    updateClearStatus();
    window.addEventListener('focus', updateClearStatus);

    return () => {
      window.removeEventListener('focus', updateClearStatus);
    };
  }, []);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
      blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
      green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-700" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-700" },
      yellow: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700" },
      orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
      pink: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", badge: "bg-pink-100 text-pink-700" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            ホーム
          </Button>
          <Badge variant="secondary" className="text-base px-4 py-2">
            {clearedDepts.length} / {departments.length} クリア
          </Badge>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
            学部選択
          </h1>
          <p className="text-gray-600">
            好きな学部から謎解きをスタートしよう！
          </p>
        </div>

        {/* 続きから再開 */}
        {(() => {
          const saved = loadGameProgress();
          if (!saved) return null;
          return (
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="text-3xl">📌</div>
                  <h2 className="text-xl font-bold text-orange-900">
                    セーブデータがあります
                  </h2>
                  <p className="text-gray-700 text-sm">
                    前回の保存: {saved.savedAt}
                  </p>
                  <Button
                    onClick={() => navigate(saved.currentPath)}
                    className="mt-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    続きから再開
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* 全クリアメッセージ */}
        {allCleared && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="text-4xl">🎉</div>
                <h2 className="text-2xl font-bold text-yellow-900">
                  全学部クリア おめでとうございます！
                </h2>
                <p className="text-gray-700">
                  1号館受付でこの画面を提示して、豪華景品を受け取ってください
                </p>
                <Button
                  onClick={() => navigate("/all-complete")}
                  className="mt-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  景品受け取り画面へ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 学部一覧 */}
        <div className="grid md:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const isCleared = clearedDepts.includes(dept.id);
            const colorClasses = getColorClasses(dept.color);
            const isAvailable = dept.id === "health-welfare" || dept.id === "pharmacy";

            return (
              <Card
                key={dept.id}
                className={`transition-all ${
                  isAvailable ? "hover:shadow-lg cursor-pointer" : "opacity-70"
                } ${isCleared ? "border-2 border-green-400" : ""}`}
              >
                <CardHeader className={`${colorClasses.bg} border-b ${colorClasses.border} relative`}>
                  {isCleared && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600 fill-green-100" />
                    </div>
                  )}
                  {!isAvailable && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gray-500 text-white text-xs">
                        Coming Soon
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{dept.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {dept.buildings}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {isAvailable ? (
                    <>
                      <div className="flex items-center justify-between">
                        <Badge className={colorClasses.badge}>
                          {dept.stages.length}つの謎
                        </Badge>
                        {isCleared && (
                          <Badge className="bg-green-100 text-green-700">
                            クリア済み ✓
                          </Badge>
                        )}
                      </div>
                      <Link to={`/department/${dept.id}/stage/1`}>
                        <Button
                          className="w-full"
                          variant={isCleared ? "outline" : "default"}
                        >
                          {isCleared ? "もう一度挑戦" : "謎解きスタート"}
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500 font-semibold">
                        4月14日以降に毎日公開予定！
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">💡 ヒント</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 各号館をクリアしたら、1号館受付でお菓子がもらえます</li>
                <li>• 階段の壁や掲示板の情報がヒントになっています</li>
                <li>• 順番は自由なので、興味のある学部から始めましょう</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}