import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
  MapPin,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Home,
  CheckSquare,
  Square,
  BookOpen
} from "lucide-react";
import { getDepartmentById, normalizeAnswer } from "../data/departments-data";
import { useBgm } from "../context/BgmContext";

export default function DepartmentStage() {
  const { departmentId, stageId } = useParams<{ departmentId: string; stageId: string }>();
  const navigate = useNavigate();
  const department = getDepartmentById(departmentId || "");
  const currentStageId = parseInt(stageId || "1");
  const stage = department?.stages.find(s => s.id === currentStageId);
  const { switchTrack } = useBgm();

  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showNext, setShowNext] = useState(false);
  const [checkedOptions, setCheckedOptions] = useState<Set<number>>(new Set());
  const [checkboxSubmitted, setCheckboxSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // 謎解き中はトキワの森BGM
  useEffect(() => {
    switchTrack("field");
  }, [switchTrack]);

  useEffect(() => {
    setUserAnswer("");
    setShowHint(false);
    setFeedback(null);
    setShowNext(false);
    setCheckedOptions(new Set());
    setCheckboxSubmitted(false);
    setShowExplanation(false);
  }, [currentStageId]);

  if (!department || !stage) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    const normalizedCorrectAnswer = normalizeAnswer(stage.answer);

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      setFeedback("correct");
      if (stage.explanation) {
        setShowExplanation(true);
      } else {
        setShowNext(true);
      }
    } else {
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleToggleCheckbox = (index: number) => {
    if (checkboxSubmitted) return;
    setCheckedOptions(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleSubmitCheckbox = () => {
    if (checkboxSubmitted) return;
    setCheckboxSubmitted(true);

    const correctSet = new Set(stage.correctIndices || []);
    const isCorrect =
      checkedOptions.size === correctSet.size &&
      [...checkedOptions].every(i => correctSet.has(i));

    if (isCorrect) {
      setFeedback("correct");
      if (stage.explanation) {
        setShowExplanation(true);
      } else {
        setShowNext(true);
      }
    } else {
      setFeedback("incorrect");
      setTimeout(() => {
        setFeedback(null);
        setCheckedOptions(new Set());
        setCheckboxSubmitted(false);
      }, 2000);
    }
  };

  const handleExplanationNext = () => {
    setShowExplanation(false);
    setShowNext(true);
  };

  const handleNext = () => {
    if (currentStageId < department.stages.length) {
      navigate(`/department/${departmentId}/stage/${currentStageId + 1}`);
    } else {
      // 最後のステージをクリアしたらバトルへ
      navigate(`/department/${departmentId}/battle`);
    }
  };

  const progressPercentage = (currentStageId / department.stages.length) * 100;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/select")}
          >
            <Home className="w-4 h-4 mr-2" />
            学部選択
          </Button>
          <Badge variant="secondary" className="text-base px-4 py-2">
            {currentStageId} / {department.stages.length}
          </Badge>
        </div>

        {/* 学部情報 */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-gray-800">{department.name}</h2>
          <p className="text-sm text-gray-600">{department.buildings}</p>
        </div>

        {/* プログレスバー */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-sm text-gray-600 text-right">
            進捗: {currentStageId} / {department.stages.length}
          </p>
        </div>

        {/* メインカード */}
        <Card className="shadow-xl">
          <CardHeader className={`bg-gradient-to-r ${colorClasses.from} ${colorClasses.to}`}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-6 h-6 text-gray-700" />
              <CardDescription className="text-base font-semibold text-gray-900">
                目的地
              </CardDescription>
            </div>
            <CardTitle className="text-3xl text-gray-900">
              {stage.location}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* 謎・ヒントは次の目的地画面では非表示 */}
            {!showNext && (
              <>
                {/* 謎 */}
                <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
                  <h3 className="font-bold text-lg text-amber-900 mb-3">📜 謎</h3>
                  <p className="text-lg whitespace-pre-line text-gray-800 leading-relaxed">
                    {stage.riddle}
                  </p>
                </div>

                {/* ヒント */}
                <div className="space-y-2">
                  {!showHint ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowHint(true)}
                    >
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
              </>
            )}

            {/* 解説画面 */}
            {showExplanation && stage.explanation && (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 font-semibold">
                    正解！よくできました！
                  </AlertDescription>
                </Alert>

                <div className="bg-emerald-50 p-5 rounded-lg border-2 border-emerald-300">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-6 h-6 text-emerald-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-emerald-900 mb-2">解説</h4>
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">{stage.explanation}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleExplanationNext}
                  className={`w-full h-12 text-lg ${colorClasses.bg} hover:opacity-90`}
                >
                  次へ進む
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* 回答フォーム */}
            {!showNext && !showExplanation ? (
              <>
                {/* テキスト入力形式 */}
                {stage.type !== "checkbox" && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        答えを入力してください
                      </label>
                      <Input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="答えを入力..."
                        className="text-lg h-12"
                        autoFocus
                      />
                    </div>

                    <Button
                      type="submit"
                      className={`w-full h-12 text-lg ${colorClasses.bg} hover:opacity-90`}
                      disabled={!userAnswer.trim()}
                    >
                      回答する
                    </Button>
                  </form>
                )}

                {/* チェックリスト形式 */}
                {stage.type === "checkbox" && stage.options && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">
                      正しいものをすべて選んでください
                    </p>
                    {stage.options.map((option, index) => {
                      const isChecked = checkedOptions.has(index);
                      const correctSet = new Set(stage.correctIndices || []);
                      const isCorrectOption = correctSet.has(index);
                      const showResult = checkboxSubmitted;

                      let btnClass = "w-full h-auto py-4 text-lg justify-start text-left";
                      if (showResult) {
                        if (isChecked && isCorrectOption) {
                          btnClass += " bg-green-500 hover:bg-green-500 text-white border-green-600";
                        } else if (isChecked && !isCorrectOption) {
                          btnClass += " bg-red-500 hover:bg-red-500 text-white border-red-600";
                        } else if (isCorrectOption) {
                          btnClass += " bg-green-100 border-green-400";
                        }
                      }

                      return (
                        <Button
                          key={index}
                          onClick={() => handleToggleCheckbox(index)}
                          disabled={checkboxSubmitted}
                          variant={isChecked ? "default" : "outline"}
                          className={btnClass}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 mr-3 flex-shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 mr-3 flex-shrink-0" />
                          )}
                          {option}
                        </Button>
                      );
                    })}

                    {!checkboxSubmitted && (
                      <Button
                        onClick={handleSubmitCheckbox}
                        disabled={checkedOptions.size === 0}
                        className={`w-full h-12 text-lg mt-2 ${colorClasses.bg} hover:opacity-90`}
                      >
                        回答する
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : null}

            {/* フィードバック */}
            {feedback === "incorrect" && (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800 font-semibold">
                  残念！答えが違います。もう一度考えてみよう。
                </AlertDescription>
              </Alert>
            )}

            {feedback === "correct" && showNext && (
              <div className="space-y-6">
                {stage.nextLocationHint && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-10 rounded-2xl border-4 border-blue-300 shadow-xl">
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="bg-blue-500 rounded-full p-5 shadow-lg">
                        <MapPin className="w-12 h-12 text-white" />
                      </div>
                      <h4 className="font-bold text-blue-900 text-3xl md:text-4xl">
                        次の目的地
                      </h4>
                      <p className="text-gray-800 text-xl md:text-2xl font-semibold leading-relaxed">
                        {stage.nextLocationHint}
                      </p>
                    </div>
                  </div>
                )}

                {stage.nextLocationDetail && (
                  <div className="bg-sky-50 p-6 rounded-xl border-2 border-sky-300 shadow-md">
                    <h5 className="font-bold text-sky-900 text-xl mb-3 flex items-center gap-2">
                      <Lightbulb className="w-6 h-6 text-sky-700" />
                      {stage.nextLocationDetail.title}
                    </h5>
                    <p className="text-gray-800 text-lg leading-relaxed">
                      {stage.nextLocationDetail.body}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleNext}
                  className={`w-full h-14 text-lg ${colorClasses.bg} hover:opacity-90`}
                >
                  {currentStageId < department.stages.length ? (
                    <>
                      目的地へ到着
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    <>
                      最終試練へ
                      <CheckCircle2 className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500">
          掲示物をよく見て、謎を解き明かそう！
        </p>
      </div>
    </div>
  );
}