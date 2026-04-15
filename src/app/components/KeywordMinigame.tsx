import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Home, Gamepad2, Trophy } from "lucide-react";
import { getDepartmentById, saveObtainedKeyword } from "../data/departments-data";
import { useBgm } from "../context/BgmContext";
import { fireCorrectEffect } from "../utils/confetti";

export default function KeywordMinigame() {
  const { departmentId, routeId } = useParams<{ departmentId: string; routeId: string }>();
  const navigate = useNavigate();
  const department = getDepartmentById(departmentId || "");
  const { switchTrack } = useBgm();
  const [cleared, setCleared] = useState(false);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    switchTrack("field");
  }, [switchTrack]);

  if (!department || !department.keywordMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>ミニゲームが見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/select")}>学部選択に戻る</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const keyword = department.keywordMode.keywords.find(k => k.id === parseInt(routeId || "0"));
  if (!keyword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>キーワードが見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(`/department/${departmentId}/keyword-hub`)}>
              キーワードハブに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 仮のミニゲーム: 10回クリックでクリア
  const goalClicks = 10;

  const handleClick = () => {
    if (cleared) return;
    const next = clicks + 1;
    setClicks(next);
    if (next >= goalClicks) {
      setCleared(true);
      fireCorrectEffect();
      saveObtainedKeyword(departmentId!, keyword.id, keyword.correctKeyword);
    }
  };

  const handleBack = () => {
    navigate(`/department/${departmentId}/keyword-hub`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <Home className="w-4 h-4 mr-2" />
            キーワードハブ
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <Gamepad2 className="w-6 h-6 text-gray-700" />
              <CardDescription className="text-base font-semibold text-gray-900">
                ミニゲーム
              </CardDescription>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {keyword.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {!cleared ? (
              <>
                <div className="text-center space-y-4">
                  <p className="text-lg text-gray-700">
                    ボタンを {goalClicks} 回クリックしてキーワードをゲット！
                  </p>
                  <div className="text-5xl font-bold text-yellow-600">
                    {clicks} / {goalClicks}
                  </div>
                </div>
                <Button
                  onClick={handleClick}
                  className="w-full h-20 text-2xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Gamepad2 className="w-8 h-8 mr-3" />
                  クリック！
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <Trophy className="w-16 h-16 text-yellow-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-700">
                    ミニゲームクリア！
                  </h2>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300 text-center">
                  <p className="text-sm text-gray-600 mb-2">キーワード入手！</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {keyword.correctKeyword}
                  </p>
                </div>
                <Button
                  onClick={handleBack}
                  className="w-full h-12 text-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  キーワードハブに戻る
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500">
          ※ 仮のミニゲーム（後日差し替え予定）
        </p>
      </div>
    </div>
  );
}
