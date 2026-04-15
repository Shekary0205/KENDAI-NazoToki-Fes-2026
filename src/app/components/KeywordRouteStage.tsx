import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  MapPin,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Home,
  Key,
  Trophy,
} from "lucide-react";
import {
  getDepartmentById,
  normalizeAnswer,
  saveObtainedKeyword,
} from "../data/departments-data";
import { useBgm } from "../context/BgmContext";
import { fireCorrectEffect } from "../utils/confetti";

export default function KeywordRouteStage() {
  const { departmentId, routeId, stageId } = useParams<{
    departmentId: string;
    routeId: string;
    stageId: string;
  }>();
  const navigate = useNavigate();
  const department = getDepartmentById(departmentId || "");
  const { switchTrack } = useBgm();

  const keyword = department?.keywordMode?.keywords.find(k => k.id === parseInt(routeId || "0"));
  const currentStageId = parseInt(stageId || "1");
  const stage = keyword?.stages?.find(s => s.id === currentStageId);

  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showNext, setShowNext] = useState(false);
  const [keywordObtained, setKeywordObtained] = useState(false);

  useEffect(() => {
    switchTrack("field");
  }, [switchTrack]);

  useEffect(() => {
    setUserAnswer("");
    setShowHint(false);
    setFeedback(null);
    setShowNext(false);
    setKeywordObtained(false);
  }, [currentStageId]);

  if (!department || !keyword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>ルートが見つかりません</CardTitle>
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

  if (!keyword.stages || keyword.stages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-6 h-6 text-gray-700" />
                <CardDescription>キーワード{keyword.id}</CardDescription>
              </div>
              <CardTitle className="text-xl">{keyword.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="text-center text-gray-700">
                このルートの謎解きは準備中です。
                <br />
                後日追加予定...
              </p>
              <Button
                onClick={() => navigate(`/department/${departmentId}/keyword-hub`)}
                className="w-full"
              >
                キーワードハブに戻る
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>ページが見つかりません</CardTitle>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(stage.answer);
    if (normalizedUser === normalizedCorrect) {
      setFeedback("correct");
      fireCorrectEffect();
      setShowNext(true);
    } else {
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleNext = () => {
    const isLastStage = currentStageId >= (keyword.stages?.length ?? 0);
    if (isLastStage) {
      // 最後のステージ → キーワード入手 → ハブに戻る
      saveObtainedKeyword(departmentId!, keyword.id, keyword.correctKeyword);
      setKeywordObtained(true);
    } else {
      navigate(`/department/${departmentId}/keyword/${routeId}/stage/${currentStageId + 1}`);
    }
  };

  const progressPercentage = ((currentStageId / (keyword.stages?.length ?? 1)) * 100);

  if (keywordObtained) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-green-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-4 border-yellow-400">
          <CardContent className="space-y-6 pt-8 text-center">
            <div className="flex justify-center">
              <Trophy className="w-20 h-20 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-yellow-900">
              キーワード入手！
            </h1>
            <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
              <p className="text-sm text-gray-600 mb-2">キーワード{keyword.id}</p>
              <p className="text-2xl font-bold text-gray-900">
                {keyword.correctKeyword}
              </p>
            </div>
            <Button
              onClick={() => navigate(`/department/${departmentId}/keyword-hub`)}
              className="w-full h-12 text-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              キーワードハブに戻る
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/department/${departmentId}/keyword-hub`)}
          >
            <Home className="w-4 h-4 mr-2" />
            キーワードハブ
          </Button>
          <Badge variant="secondary" className="text-base px-4 py-2">
            {currentStageId} / {keyword.stages.length}
          </Badge>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-gray-800">
            キーワード{keyword.id}: {keyword.label}
          </h2>
        </div>

        {/* メインカード */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
            {!showNext && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-6 h-6 text-gray-700" />
                  <CardDescription className="text-base font-semibold text-gray-900">
                    目的地
                  </CardDescription>
                </div>
                <CardTitle className="text-3xl text-gray-900">
                  {stage.location}
                </CardTitle>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {!showNext && (
              <>
                <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
                  <h3 className="font-bold text-lg text-amber-900 mb-3">📜 謎</h3>
                  <p className="text-lg whitespace-pre-line text-gray-800 leading-relaxed">
                    {stage.riddle}
                  </p>
                </div>

                {stage.hint && (
                  <div className="space-y-2">
                    {!showHint ? (
                      <Button variant="outline" className="w-full" onClick={() => setShowHint(true)}>
                        <Lightbulb className="w-4 h-4 mr-2" />
                        ヒントを見る
                      </Button>
                    ) : (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-yellow-900 mb-1">ヒント</h4>
                            <p className="text-gray-700">{stage.hint}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="答えを入力..."
                    className="text-lg h-12"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-yellow-600 hover:bg-yellow-700"
                    disabled={!userAnswer.trim()}
                  >
                    回答する
                  </Button>
                </form>
              </>
            )}

            {feedback === "incorrect" && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800 font-semibold">
                    残念！答えが違います。もう一度考えてみよう。
                  </p>
                </div>
              </div>
            )}

            {feedback === "correct" && showNext && (
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-green-800 font-semibold">
                      正解！よくできました！
                    </p>
                  </div>
                </div>

                {stage.nextLocationHint && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-10 rounded-2xl border-4 border-yellow-300 shadow-xl">
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="bg-yellow-500 rounded-full p-5 shadow-lg">
                        <MapPin className="w-12 h-12 text-white" />
                      </div>
                      <h4 className="font-bold text-yellow-900 text-3xl">次の目的地</h4>
                      <p className="text-gray-800 text-xl font-semibold leading-relaxed whitespace-pre-line">
                        {stage.nextLocationHint}
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleNext}
                  className="w-full h-14 text-lg bg-yellow-600 hover:bg-yellow-700"
                >
                  {currentStageId < keyword.stages.length ? (
                    <>
                      目的地へ到着
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    <>
                      キーワードを入手
                      <Key className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
