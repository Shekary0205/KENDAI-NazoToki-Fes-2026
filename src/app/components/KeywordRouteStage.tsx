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
  Save,
  Package,
  AlertTriangle,
  Sparkles,
  Swords,
} from "lucide-react";
import {
  getDepartmentById,
  normalizeAnswer,
  saveObtainedKeyword,
  saveKeywordStageProgress,
  clearKeywordStageProgress,
  addItem,
  getObtainedItems,
  removeItem,
  hasSeenItemTutorial,
  markItemTutorialSeen,
  type ItemData,
} from "../data/departments-data";
import { useBgm } from "../context/BgmContext";
import { fireCorrectEffect } from "../utils/confetti";

type Phase =
  | "question"
  | "itemReward"
  | "accidentIntro"
  | "accidentScreen"
  | "itemTutorial"
  | "itemSelect"
  | "accidentResolved"
  | "nextLocation"
  | "keywordObtained";

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
  const [multiInputs, setMultiInputs] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [phase, setPhase] = useState<Phase>("question");
  const [inventory, setInventory] = useState<ItemData[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemUseError, setItemUseError] = useState<string | null>(null);

  useEffect(() => {
    switchTrack("field");
  }, [switchTrack]);

  useEffect(() => {
    setUserAnswer("");
    setMultiInputs(stage?.multiAnswers ? stage.multiAnswers.map(() => "") : []);
    setShowHint(false);
    setFeedback(null);
    setPhase("question");
    setSelectedItemId(null);
    setItemUseError(null);
    setInventory(getObtainedItems());
    if (departmentId && routeId) {
      saveKeywordStageProgress(departmentId, parseInt(routeId), currentStageId);
    }
  }, [currentStageId, departmentId, routeId, stage]);

  // 共通: stage がない場合
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

  // 正解判定の共通処理
  const proceedAfterCorrect = () => {
    // アイテム入手があればまずそれを表示
    if (stage.itemReward) {
      addItem(stage.itemReward);
      setInventory(getObtainedItems());
      setPhase("itemReward");
      return;
    }
    // アクシデントがあればアクシデント演出へ
    if (stage.accident) {
      setPhase("accidentIntro");
      setTimeout(() => {
        setPhase("accidentScreen");
      }, 2500);
      return;
    }
    // それ以外は次の目的地へ
    setPhase("nextLocation");
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(stage.answer);
    if (normalizedUser === normalizedCorrect) {
      setFeedback("correct");
      fireCorrectEffect();
      proceedAfterCorrect();
    } else {
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleMultiInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stage.multiAnswers) return;
    const allCorrect = stage.multiAnswers.every((acceptable, i) => {
      const userVal = normalizeAnswer(multiInputs[i] || "");
      return acceptable.some(a => normalizeAnswer(a) === userVal);
    });
    if (allCorrect) {
      setFeedback("correct");
      fireCorrectEffect();
      proceedAfterCorrect();
    } else {
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  // アイテム入手画面から次へ
  const handleItemRewardContinue = () => {
    if (stage.accident) {
      setPhase("accidentIntro");
      setTimeout(() => setPhase("accidentScreen"), 2500);
    } else {
      setPhase("nextLocation");
    }
  };

  // アクシデント画面から「アイテムを使う」を押下
  const handleOpenItemSelect = () => {
    if (stage.accident?.showTutorial && !hasSeenItemTutorial()) {
      setPhase("itemTutorial");
    } else {
      setPhase("itemSelect");
    }
  };

  const handleCloseTutorial = () => {
    markItemTutorialSeen();
    setPhase("itemSelect");
  };

  const handleUseItem = () => {
    if (!selectedItemId) return;
    if (selectedItemId === stage.accident?.requiredItemId) {
      // 使用したアイテムを消費
      removeItem(selectedItemId);
      setInventory(getObtainedItems());
      setSelectedItemId(null);
      setItemUseError(null);
      setPhase("accidentResolved");
    } else {
      setItemUseError("そのアイテムではこのアクシデントは解決できない...");
      setTimeout(() => setItemUseError(null), 2500);
    }
  };

  const handleNext = () => {
    // このステージ終了後に戦闘があるかチェック
    const battle = keyword.battles?.find(b => b.afterStageId === currentStageId);
    if (battle) {
      navigate(`/department/${departmentId}/keyword/${routeId}/battle/${battle.id}`);
      return;
    }

    const isLastStage = currentStageId >= (keyword.stages?.length ?? 0);
    if (isLastStage) {
      saveObtainedKeyword(departmentId!, keyword.id, keyword.correctKeyword);
      clearKeywordStageProgress(departmentId!, keyword.id);
      setPhase("keywordObtained");
    } else {
      navigate(`/department/${departmentId}/keyword/${routeId}/stage/${currentStageId + 1}`);
    }
  };

  const handleSaveAndExit = () => {
    if (departmentId && routeId) {
      saveKeywordStageProgress(departmentId, parseInt(routeId), currentStageId);
    }
    navigate(`/department/${departmentId}/keyword-hub`);
  };

  // ===== 画面ごとの描画 =====

  // キーワード入手画面
  if (phase === "keywordObtained") {
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

  // アクシデント演出（控えめなフェード＋シェイク）
  if (phase === "accidentIntro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-red-800 flex items-center justify-center p-4 animate-accidentFadeIn">
        <div className="text-center space-y-6 animate-accidentShake">
          <AlertTriangle className="w-32 h-32 text-yellow-300 mx-auto" />
          <h1 className="text-6xl md:text-7xl font-black text-white drop-shadow-2xl tracking-widest">
            ⚠️ アクシデント！
          </h1>
        </div>
        <style>{`
          @keyframes accidentFadeIn {
            0% { opacity: 0; }
            30% { opacity: 1; }
            100% { opacity: 1; }
          }
          @keyframes accidentShake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
          .animate-accidentFadeIn { animation: accidentFadeIn 0.6s ease-out forwards; }
          .animate-accidentShake { animation: accidentShake 0.8s ease-in-out; }
        `}</style>
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

        {/* 問題画面 */}
        {phase === "question" && (
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-6 h-6 text-gray-700" />
                <CardDescription className="text-base font-semibold text-gray-900">
                  目的地
                </CardDescription>
              </div>
              <CardTitle className="text-3xl text-gray-900">{stage.location}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
                <h3 className="font-bold text-lg text-amber-900 mb-3">📜 謎</h3>
                <p className="text-lg whitespace-pre-line text-gray-800 leading-relaxed">
                  {stage.riddle}
                </p>
              </div>

              {(stage.hint || stage.hintUrl) && (
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
                          {stage.hint && <p className="text-gray-700">{stage.hint}</p>}
                          {stage.hintUrl && (
                            <a
                              href={stage.hintUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-2 text-blue-600 underline text-sm font-semibold break-all"
                            >
                              📎 ヒントのリンクを開く
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* テキスト入力 */}
              {(!stage.type || stage.type === "text") && (
                <form onSubmit={handleTextSubmit} className="space-y-4">
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
              )}

              {/* 複数入力ボックス */}
              {stage.type === "multi-input" && stage.multiAnswers && (
                <form onSubmit={handleMultiInputSubmit} className="space-y-4">
                  {stage.multiAnswers.map((_, index) => (
                    <div key={index}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {stage.inputLabels?.[index] || `答え ${index + 1}`}
                      </label>
                      <Input
                        type="text"
                        value={multiInputs[index] || ""}
                        onChange={(e) => {
                          const next = [...multiInputs];
                          next[index] = e.target.value;
                          setMultiInputs(next);
                        }}
                        placeholder="答えを入力..."
                        className="text-lg h-12"
                        autoFocus={index === 0}
                      />
                    </div>
                  ))}
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-yellow-600 hover:bg-yellow-700"
                    disabled={multiInputs.some(v => !v.trim())}
                  >
                    回答する
                  </Button>
                </form>
              )}

              {/* 途中保存ボタン */}
              <Button
                variant="outline"
                onClick={handleSaveAndExit}
                className="w-full h-11 border-2 border-orange-400 text-orange-700 hover:bg-orange-50"
              >
                <Save className="w-4 h-4 mr-2" />
                途中保存してキーワード選択画面に戻る
              </Button>

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
            </CardContent>
          </Card>
        )}

        {/* アイテム入手画面 */}
        {phase === "itemReward" && stage.itemReward && (
          <Card className="shadow-2xl border-4 border-purple-400">
            <CardContent className="space-y-6 pt-8 text-center">
              <div className="flex justify-center">
                <div className="bg-purple-500 rounded-full p-6 shadow-xl animate-bounce">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-purple-900">アイテム入手！</h2>
              <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-300">
                <div className="text-7xl mb-3">{stage.itemReward.icon}</div>
                <p className="text-2xl font-bold text-gray-900">{stage.itemReward.name}</p>
                {stage.itemReward.description && (
                  <p className="text-sm text-gray-600 mt-2">{stage.itemReward.description}</p>
                )}
              </div>
              <Button
                onClick={handleItemRewardContinue}
                className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700"
              >
                続ける
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* アクシデント画面 */}
        {phase === "accidentScreen" && stage.accident && (
          <Card className="shadow-2xl border-4 border-red-500">
            <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-7 h-7 text-white" />
                <CardTitle className="text-2xl text-white">{stage.accident.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {stage.accident.image && (
                <div className="rounded-lg overflow-hidden border-2 border-red-300 shadow-lg">
                  <img
                    src={stage.accident.image}
                    alt="アクシデント"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-gray-800 font-semibold whitespace-pre-line leading-relaxed">
                  {stage.accident.message}
                </p>
              </div>
              <Button
                onClick={handleOpenItemSelect}
                className="w-full h-14 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <Package className="w-5 h-5 mr-2" />
                アイテムを使う
              </Button>

              {/* 途中保存ボタン */}
              <Button
                variant="outline"
                onClick={handleSaveAndExit}
                className="w-full h-11 border-2 border-orange-400 text-orange-700 hover:bg-orange-50"
              >
                <Save className="w-4 h-4 mr-2" />
                途中保存してキーワード選択画面に戻る
              </Button>
            </CardContent>
          </Card>
        )}

        {/* アクシデント解決画面 */}
        {phase === "accidentResolved" && stage.accident && (
          <Card className="shadow-2xl border-4 border-green-400">
            <CardContent className="space-y-6 pt-8 text-center">
              <div className="flex justify-center">
                <div className="bg-green-500 rounded-full p-6 shadow-xl animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-900">アクシデント回避！</h2>
              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
                <p className="text-lg text-gray-800 leading-relaxed">
                  {stage.accident.successMessage || "アクシデントを回避しました！"}
                </p>
              </div>
              <Button
                onClick={() => setPhase("nextLocation")}
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
              >
                続ける
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 次の目的地画面 */}
        {phase === "nextLocation" && (
          <Card className="shadow-xl">
            <CardContent className="space-y-6 pt-6">
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
                {keyword.battles?.some(b => b.afterStageId === currentStageId) ? (
                  <>
                    戦闘へ挑む
                    <Swords className="w-5 h-5 ml-2" />
                  </>
                ) : currentStageId < keyword.stages.length ? (
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
            </CardContent>
          </Card>
        )}

        {/* インベントリ表示 */}
        <Card className="bg-gray-50 border-2 border-gray-300">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-gray-700" />
              <h4 className="font-bold text-gray-800">所持アイテム</h4>
              <Badge variant="secondary" className="ml-auto">
                {inventory.length}
              </Badge>
            </div>
            {inventory.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-2">
                まだアイテムを持っていません
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {inventory.map(item => (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-gray-300 rounded-lg p-2 flex items-center gap-2 shadow-sm"
                    title={item.description}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-semibold">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* チュートリアルモーダル */}
      {phase === "itemTutorial" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full shadow-2xl border-4 border-yellow-400">
            <CardHeader className="bg-gradient-to-r from-yellow-100 to-amber-100">
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-yellow-700" />
                <CardTitle className="text-lg">アイテム使用チュートリアル</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                アクシデントが発生しました。
                {"\n"}アイテムをリストから選択してこの状況を回避しよう。
                {"\n\n"}必要なアイテムを所持していない場合、別のキーワードの謎を解くと手に入るかも？？
              </p>
              <Button
                onClick={handleCloseTutorial}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                わかった！
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* アイテム選択モーダル */}
      {phase === "itemSelect" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg">アイテムを選択</CardTitle>
              <CardDescription>使用するアイテムを選んでください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inventory.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  所持しているアイテムがありません
                </p>
              ) : (
                <div className="space-y-2">
                  {inventory.map(item => {
                    const isSelected = selectedItemId === item.id;
                    return (
                      <Button
                        key={item.id}
                        variant="outline"
                        onClick={() => setSelectedItemId(item.id)}
                        className={`w-full h-auto py-3 justify-start ${
                          isSelected ? "border-4 border-yellow-500 bg-yellow-50" : ""
                        }`}
                      >
                        <span className="text-3xl mr-3">{item.icon}</span>
                        <div className="text-left flex-1">
                          <div className="font-bold">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-600">{item.description}</div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}

              {itemUseError && (
                <p className="text-sm text-red-600 font-semibold text-center">
                  {itemUseError}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedItemId(null);
                    setPhase("accidentScreen");
                  }}
                >
                  戻る
                </Button>
                <Button
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  onClick={handleUseItem}
                  disabled={!selectedItemId}
                >
                  使う
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
