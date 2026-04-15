import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Home, Key, CheckCircle2, MapPin, Gamepad2, Trophy } from "lucide-react";
import {
  getDepartmentById,
  getObtainedKeywords,
  normalizeAnswer,
  markDepartmentAsCleared,
} from "../data/departments-data";
import { useBgm } from "../context/BgmContext";
import { fireCorrectEffect } from "../utils/confetti";

export default function KeywordHub() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const department = getDepartmentById(departmentId || "");
  const { switchTrack } = useBgm();

  const [obtainedKeywords, setObtainedKeywords] = useState<Record<number, string>>({});
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    switchTrack("field");
  }, [switchTrack]);

  useEffect(() => {
    if (!departmentId) return;
    setObtainedKeywords(getObtainedKeywords(departmentId));
  }, [departmentId]);

  if (!department || !department.keywordMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>キーワード収集モードではありません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/select")}>学部選択に戻る</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { keywords } = department.keywordMode;

  const handleRouteClick = (routeId: number, routeType: "stages" | "minigame") => {
    if (routeType === "minigame") {
      navigate(`/department/${departmentId}/keyword/${routeId}/minigame`);
    } else {
      navigate(`/department/${departmentId}/keyword/${routeId}/stage/1`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allCorrect = keywords.every(kw => {
      const userVal = normalizeAnswer(inputs[kw.id] || "");
      const correctVal = normalizeAnswer(kw.correctKeyword);
      return userVal === correctVal;
    });

    if (allCorrect) {
      setFeedback("correct");
      fireCorrectEffect();
      markDepartmentAsCleared(departmentId!);
      setCleared(true);
      setTimeout(() => {
        navigate(`/department/${departmentId}/complete`);
      }, 2000);
    } else {
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { from: string; to: string; bg: string }> = {
      yellow: { from: "from-yellow-100", to: "to-yellow-50", bg: "bg-yellow-600" },
      blue: { from: "from-blue-100", to: "to-blue-50", bg: "bg-blue-600" },
      green: { from: "from-green-100", to: "to-green-50", bg: "bg-green-600" },
      purple: { from: "from-purple-100", to: "to-purple-50", bg: "bg-purple-600" },
      orange: { from: "from-orange-100", to: "to-orange-50", bg: "bg-orange-600" },
      pink: { from: "from-pink-100", to: "to-pink-50", bg: "bg-pink-600" },
    };
    return colors[color] || colors.yellow;
  };

  const colorClasses = getColorClasses(department.color);
  const obtainedCount = Object.keys(obtainedKeywords).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate("/select")}>
            <Home className="w-4 h-4 mr-2" />
            学部選択
          </Button>
          <Badge variant="secondary" className="text-base px-4 py-2">
            {obtainedCount} / {keywords.length} 入手
          </Badge>
        </div>

        {/* 学部情報 */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-gray-800">{department.name}</h2>
          <p className="text-sm text-gray-600">{department.buildings}</p>
        </div>

        {/* タイトル */}
        <Card className="shadow-xl">
          <CardHeader className={`bg-gradient-to-r ${colorClasses.from} ${colorClasses.to}`}>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-6 h-6 text-gray-700" />
              <CardDescription className="text-base font-semibold text-gray-900">
                キーワード収集
              </CardDescription>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              3つのキーワードを入手せよ！
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* 3つのルートボタン */}
            <div className="space-y-3">
              {keywords.map(kw => {
                const isObtained = !!obtainedKeywords[kw.id];
                return (
                  <Button
                    key={kw.id}
                    onClick={() => handleRouteClick(kw.id, kw.routeType)}
                    variant="outline"
                    className={`w-full h-auto py-4 justify-start text-left ${
                      isObtained ? "bg-green-50 border-green-400" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-2 rounded-full ${
                        isObtained ? "bg-green-500" : "bg-gray-300"
                      }`}>
                        {isObtained ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : kw.routeType === "minigame" ? (
                          <Gamepad2 className="w-5 h-5 text-white" />
                        ) : (
                          <MapPin className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base text-gray-900">
                          キーワード{kw.id}: {kw.label}
                        </div>
                        <div className="text-sm text-gray-600">{kw.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* キーワード入力フォーム */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-lg text-gray-800">キーワード入力</h3>
              {keywords.map(kw => (
                <div key={kw.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    キーワード{kw.id}
                  </label>
                  <Input
                    type="text"
                    value={inputs[kw.id] || ""}
                    onChange={(e) => setInputs({ ...inputs, [kw.id]: e.target.value })}
                    placeholder={`キーワード${kw.id}を入力...`}
                    className="text-lg h-12"
                  />
                </div>
              ))}

              <Button
                type="submit"
                className={`w-full h-12 text-lg ${colorClasses.bg} hover:opacity-90`}
                disabled={cleared || keywords.some(k => !inputs[k.id]?.trim())}
              >
                {cleared ? (
                  <>
                    <Trophy className="w-5 h-5 mr-2" />
                    クリア！
                  </>
                ) : (
                  "回答する"
                )}
              </Button>

              {feedback === "incorrect" && (
                <p className="text-center text-red-600 font-semibold">
                  キーワードが違います。もう一度確認してみよう。
                </p>
              )}
              {feedback === "correct" && (
                <p className="text-center text-green-600 font-bold text-lg">
                  全問正解！クリア画面へ移動します...
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500">
          各ルートを探索してキーワードを手に入れよう！
        </p>
      </div>
    </div>
  );
}
