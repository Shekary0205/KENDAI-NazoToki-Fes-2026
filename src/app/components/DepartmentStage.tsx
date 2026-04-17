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
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  getDepartmentById,
  normalizeAnswer,
  isCropDepartment,
  getCropState,
  seedCrop,
  feedCrop,
  digestCrop,
  getCropVisual,
  getCropGrowthLevel,
  getCropEvolutionName,
  saveCropState,
  hasSeenAgrItemTutorial,
  markAgrItemTutorialSeen,
  isHeartItem,
  getItemStat,
  CROP_FULLNESS_MAX,
  CROP_STAT_INFO,
  getObtainedItems,
  addItem,
  removeItem,
  pushStateSnapshot,
  type CropState,
  type ItemData,
  type CropStat,
} from "../data/departments-data";
import { useBgm } from "../context/BgmContext";
import { fireCorrectEffect } from "../utils/confetti";

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
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [multiInputs, setMultiInputs] = useState<string[]>([]);
  // 農学部 育成シミュレーター v2
  const isCrop = departmentId ? isCropDepartment(departmentId) : false;
  const [cropState, setCropStateLocal] = useState<CropState>(() =>
    departmentId ? getCropState(departmentId) : { seeded: false, totalFeeds: 0, fullness: 0, rewardTimings: 0, kindness: 0, strength: 0, wisdom: 0 }
  );
  const [feedAnimation, setFeedAnimation] = useState<string | null>(null);
  const [feedToast, setFeedToast] = useState<string | null>(null);
  const [showSeeding, setShowSeeding] = useState(false);
  const [seedingDone, setSeedingDone] = useState(false);
  const [inventory, setInventory] = useState<ItemData[]>(() => getObtainedItems());
  const [showItemRewards, setShowItemRewards] = useState(false);
  const [showGrowthScreen, setShowGrowthScreen] = useState(false);
  const [growthScreenVisual, setGrowthScreenVisual] = useState<{ image: string; label: string; level: number } | null>(null);
  const [cropNicknameInput, setCropNicknameInput] = useState("");
  const [showAgrFeedGuide, setShowAgrFeedGuide] = useState(false);

  // 謎解き中のBGM（ステージごとに異なるトラックを再生）
  useEffect(() => {
    const track = (stage?.bgm || "field") as import("../context/BgmContext").BgmTrack;
    switchTrack(track);
  }, [switchTrack, stage]);

  useEffect(() => {
    // ブラウザバック対策: このステージの初期状態を history.state に保存
    pushStateSnapshot();
    setUserAnswer("");
    setShowHint(false);
    setFeedback(null);
    setShowNext(false);
    setCheckedOptions(new Set());
    setCheckboxSubmitted(false);
    setShowExplanation(false);
    setSelectedOption(null);
    setMultiInputs(stage?.multiAnswers ? stage.multiAnswers.map(() => "") : []);
    setFeedAnimation(null);
    setFeedToast(null);
    setShowSeeding(false);
    setSeedingDone(false);
    setShowItemRewards(false);
    setShowAgrFeedGuide(false);
    setInventory(getObtainedItems());
    if (departmentId && isCrop) {
      setCropStateLocal(getCropState(departmentId));
    }
  }, [currentStageId, departmentId, isCrop]);

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

  // 全報酬アイテムを取得するヘルパー
  const getAllRewards = (): ItemData[] => {
    const rewards: ItemData[] = [];
    if (stage.itemReward) rewards.push(stage.itemReward);
    if (stage.itemRewards) rewards.push(...stage.itemRewards);
    return rewards;
  };

  // 正解後に進むフェーズを決定する共通ハンドラ
  const handleCorrectAnswerAdvance = () => {
    if (stage.explanation) {
      setShowExplanation(true);
      return;
    }
    // 農学部ステージ1正解 → 種まきフェーズ
    if (isCrop && currentStageId === 1 && !cropState.seeded) {
      setShowSeeding(true);
      return;
    }
    // アイテム報酬がある場合は報酬画面を表示
    const rewards = getAllRewards();
    if (rewards.length > 0) {
      rewards.forEach(item => addItem(item));
      setInventory(getObtainedItems());
      // 農学部: recoversFullness フラグがあるステージのみ満腹度回復
      if (isCrop && departmentId && stage.recoversFullness) {
        const latestCrop = getCropState(departmentId);
        if (latestCrop.seeded) {
          const updated = digestCrop(departmentId);
          setCropStateLocal(updated);
        }
      }
      setShowItemRewards(true);
      return;
    }
    if (stage.skipNextLocationScreen) {
      handleNext();
      return;
    }
    setShowNext(true);
  };

  // 種を植える
  const handleSeedPlant = () => {
    if (!departmentId) return;
    const updated = seedCrop(departmentId);
    setCropStateLocal(updated);
    setSeedingDone(true);
    fireCorrectEffect();
  };

  const handleSeedingContinue = () => {
    setShowSeeding(false);
    setSeedingDone(false);
    if (stage.skipNextLocationScreen) {
      handleNext();
    } else {
      setShowNext(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    const normalizedCorrectAnswer = normalizeAnswer(stage.answer);

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      setFeedback("correct");
      fireCorrectEffect();
      handleCorrectAnswerAdvance();
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
      fireCorrectEffect();
      handleCorrectAnswerAdvance();
    } else {
      setFeedback("incorrect");
      setTimeout(() => {
        setFeedback(null);
        setCheckedOptions(new Set());
        setCheckboxSubmitted(false);
      }, 2000);
    }
  };

  const handleNext = () => {
    // キーワード収集モード: 指定ステージクリア後にキーワードハブへ
    if (
      department.keywordMode?.enabled &&
      currentStageId === department.keywordMode.afterStageId
    ) {
      navigate(`/department/${departmentId}/keyword-hub`);
      return;
    }

    // このステージ終了後に中間バトルがあるかチェック
    const midBattle = department.midBattles?.find(b => b.afterStageId === currentStageId);
    if (midBattle) {
      navigate(`/department/${departmentId}/midbattle/${midBattle.id}`);
      return;
    }

    if (currentStageId < department.stages.length) {
      navigate(`/department/${departmentId}/stage/${currentStageId + 1}`);
    } else {
      // 最後のステージをクリアしたらバトルへ
      navigate(`/department/${departmentId}/battle`);
    }
  };

  // select 形式の回答処理（間違えても正解を見せず繰り返す）
  const handleSelectOption = (index: number) => {
    if (index === stage.correctIndex) {
      setSelectedOption(index);
      setFeedback("correct");
      fireCorrectEffect();
      handleCorrectAnswerAdvance();
    } else {
      setSelectedOption(index);
      setFeedback("incorrect");
      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
      }, 1500);
    }
  };

  // multi-input 形式の回答処理
  const handleMultiInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stage.multiAnswers) return;

    const allCorrect = stage.multiAnswers.every((acceptableAnswers, i) => {
      const userVal = normalizeAnswer(multiInputs[i] || "");
      return acceptableAnswers.some(a => normalizeAnswer(a) === userVal);
    });

    if (allCorrect) {
      setFeedback("correct");
      fireCorrectEffect();
      handleCorrectAnswerAdvance();
    } else {
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleExplanationNext = () => {
    setShowExplanation(false);
    // 農学部ステージ1 → 種まき
    if (isCrop && currentStageId === 1 && !cropState.seeded) {
      setShowSeeding(true);
      return;
    }
    // アイテム報酬がある場合
    const rewards = getAllRewards();
    if (rewards.length > 0) {
      rewards.forEach(item => addItem(item));
      setInventory(getObtainedItems());
      if (isCrop && departmentId && stage.recoversFullness) {
        const latestCrop = getCropState(departmentId);
        if (latestCrop.seeded) {
          const updated = digestCrop(departmentId);
          setCropStateLocal(updated);
        }
      }
      setShowItemRewards(true);
      return;
    }
    if (stage.skipNextLocationScreen) {
      handleNext();
    } else {
      setShowNext(true);
    }
  };

  // 所持アイテムを作物に与える
  const handleFeedCrop = (item: ItemData) => {
    if (!departmentId || cropState.fullness >= CROP_FULLNESS_MAX) return;
    // 心アイテムは1つのみ使用可能
    const heart = isHeartItem(item.id);
    if (heart && cropState.usedHeartId) {
      setFeedToast("❌ 心のアイテムは1つしか使えません");
      setTimeout(() => setFeedToast(null), 2500);
      return;
    }
    // 心アイテムは進化済み（基本進化名がある）でなければ使えない
    if (heart && !getCropEvolutionName(cropState)) {
      setFeedToast("❌ まず作物を進化させよう（ステータス2以上）");
      setTimeout(() => setFeedToast(null), 2500);
      return;
    }
    const prevLevel = getCropGrowthLevel(cropState);
    const prevEvo = getCropEvolutionName(cropState);
    // アイテムをインベントリから削除
    removeItem(item.id);
    setInventory(getObtainedItems());
    // 作物の成長（ステータスも加算 / 心なら最終進化）
    const updated = feedCrop(departmentId, item.id);
    setCropStateLocal(updated);
    const newLevel = getCropGrowthLevel(updated);
    const newEvo = getCropEvolutionName(updated);
    // チュートリアル中にフィードした場合 → チュートリアル完了（状態はフラグで継続管理）
    const wasInTutorial = showAgrFeedGuide;
    if (wasInTutorial) {
      markAgrItemTutorialSeen();
    }
    // ステータス情報
    const stat = getItemStat(item.id);
    const statLabel = stat ? CROP_STAT_INFO[stat] : null;
    // アニメーション
    setFeedAnimation(item.id);
    setTimeout(() => setFeedAnimation(null), 600);
    if (heart && newEvo && newEvo !== prevEvo) {
      // 心使用 → 最終進化セレモニー
      const visual = getCropVisual(updated);
      fireCorrectEffect();
      setTimeout(() => fireCorrectEffect(), 300);
      setGrowthScreenVisual({ image: visual.image, label: newEvo, level: 99 });
      setShowGrowthScreen(true);
    } else if (newLevel > prevLevel || (newEvo && newEvo !== prevEvo)) {
      // レベルアップ or 進化 → 成長画面を表示
      const visual = getCropVisual(updated);
      fireCorrectEffect();
      setGrowthScreenVisual({ image: visual.image, label: newEvo ?? visual.label, level: newLevel });
      setCropNicknameInput("");
      setShowGrowthScreen(true);
    } else if (statLabel) {
      setFeedToast(`${item.icon} ${item.name}をあげた！ ${statLabel.icon}${statLabel.label}+1`);
      setTimeout(() => setFeedToast(null), 2500);
    } else {
      setFeedToast(`${item.icon} ${item.name}をあげた！`);
      setTimeout(() => setFeedToast(null), 2500);
    }
    // チュートリアル完了後 & 成長画面が出ない場合は即 showNext
    if (wasInTutorial && newLevel <= prevLevel) {
      setShowAgrFeedGuide(false);
      if (stage.skipNextLocationScreen) handleNext();
      else setShowNext(true);
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
    <div key={`${departmentId}-${stageId}`} className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 py-8">
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

        {/* 農学部 育成シミュレーター — 作物パネル（種まき後のみ表示） */}
        {isCrop && cropState.seeded && (() => {
          const visual = getCropVisual(cropState);
          const fullnessPercent = (cropState.fullness / CROP_FULLNESS_MAX) * 100;
          const isFull = cropState.fullness >= CROP_FULLNESS_MAX;
          const evoName = getCropEvolutionName(cropState);
          return (
            <Card className={`border-2 shadow-md transition-all ${feedAnimation ? "animate-shake border-yellow-400 bg-yellow-50" : "border-green-300 bg-gradient-to-r from-green-50 via-emerald-50 to-lime-50"}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  {/* 作物アイコン */}
                  <div className={`flex-shrink-0 w-20 h-20 rounded-full overflow-hidden border-4 shadow-lg bg-white flex items-center justify-center ${feedAnimation ? "border-yellow-400" : "border-green-400"}`}>
                    {visual.image ? (
                      <img src={visual.image} alt={visual.label} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🌱</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-green-900 text-sm truncate">
                          {cropState.nickname ?? "育成中の作物"}
                        </h3>
                        {evoName && (
                          <p className="text-[10px] text-purple-700 font-semibold truncate">{evoName}</p>
                        )}
                      </div>
                      <span className={`text-xs font-semibold ${visual.color} flex-shrink-0`}>
                        {visual.label}
                      </span>
                    </div>
                    {/* ステータスバー */}
                    <div className="flex items-center gap-3 text-xs">
                      {(["kindness", "strength", "wisdom"] as CropStat[]).map(stat => {
                        const info = CROP_STAT_INFO[stat];
                        const val = cropState[stat];
                        return (
                          <span key={stat} className={`font-semibold ${val >= 3 ? info.color : "text-gray-500"}`}>
                            {info.icon}{val}
                          </span>
                        );
                      })}
                    </div>
                    {/* 満腹メーター */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">満腹度</span>
                        <span className={isFull ? "text-red-600 font-bold" : "text-gray-600"}>
                          {isFull ? "おなかいっぱい！" : `${cropState.fullness} / ${CROP_FULLNESS_MAX}`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isFull ? "bg-red-500" : cropState.fullness > 70 ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          style={{ width: `${fullnessPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* 所持アイテム一覧（フィード用・農学部アイテムのみ） */}
                {inventory.filter(i => i.id.startsWith("agr-")).length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 font-semibold mb-2 text-center">
                      アイテムをタップして作物にあげよう
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {inventory.filter(i => i.id.startsWith("agr-")).map((item, idx) => {
                        const stat = getItemStat(item.id);
                        const statInfo = stat ? CROP_STAT_INFO[stat] : null;
                        return (
                          <button
                            key={`${item.id}-${idx}`}
                            onClick={() => handleFeedCrop(item)}
                            disabled={isFull}
                            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border-2 transition-all min-w-[60px]
                              ${isFull
                                ? "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                                : "border-green-300 bg-white hover:bg-green-50 hover:border-green-500 active:scale-95 shadow-sm"
                              }`}
                          >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-semibold text-gray-700 leading-tight">{item.name}</span>
                            {statInfo && (
                              <span className={`text-[9px] font-bold ${statInfo.color}`}>
                                {statInfo.icon}{statInfo.label}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {inventory.filter(i => i.id.startsWith("agr-")).length === 0 && (
                  <p className="mt-3 text-center text-xs text-gray-500">
                    アイテムがありません。謎を解いて入手しよう！
                  </p>
                )}
                {/* フィードトースト */}
                {feedToast && (
                  <div className="mt-2 text-center text-sm font-bold text-green-800 bg-green-100 border border-green-300 rounded-lg py-1.5 animate-pulse">
                    {feedToast}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* メインカード */}
        <Card className="shadow-xl">
          <CardHeader className={`bg-gradient-to-r ${colorClasses.from} ${colorClasses.to}`}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-6 h-6 text-gray-700" />
              <CardDescription className="text-base font-semibold text-gray-900">
                現在地
              </CardDescription>
              {/8号館[45]階|9号館4階/.test(stage.location) && (
                <span className="text-xs text-red-600 font-semibold ml-auto">
                  研究室前ではお静かに。
                </span>
              )}
            </div>
            <CardTitle className="text-3xl text-gray-900">
              {stage.location}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* 謎・ヒントは各フェーズ画面では非表示 */}
            {!showNext && !showExplanation && !showSeeding && !showItemRewards && !showAgrFeedGuide && (
              <>
                {/* 謎 */}
                <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
                  <h3 className="font-bold text-lg text-amber-900 mb-3">📜 謎</h3>
                  <p className="text-lg whitespace-pre-line text-gray-800 leading-relaxed">
                    {stage.riddle}
                  </p>
                  {stage.riddleImage && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={stage.riddleImage}
                        alt="謎の画像"
                        className="max-w-full h-auto rounded-lg shadow-md border-2 border-amber-300"
                      />
                    </div>
                  )}
                </div>

                {/* ヒント */}
                {stage.hint && (
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
                            {stage.hintUrl && (
                              <a
                                href={stage.hintUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 text-blue-600 underline text-sm font-semibold"
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

                <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
                  <h4 className="font-bold text-amber-900 text-sm mb-2">正解</h4>
                  <p className="text-lg font-bold text-gray-900">
                    {stage.type === "checkbox"
                      ? (stage.correctIndices || [])
                          .map(i => (stage.options || [])[i])
                          .join(" / ")
                      : stage.answer}
                  </p>
                </div>

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

            {/* アイテム入手画面 */}
            {showItemRewards && (() => {
              const rewards = getAllRewards();
              return (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="inline-block bg-purple-500 rounded-full p-4 shadow-xl animate-bounce">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-purple-900">アイテム入手！</h2>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-300 space-y-3">
                    {rewards.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-purple-200">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {isCrop && cropState.seeded && (
                    <p className="text-center text-sm text-green-700 font-semibold">
                      💡 入手したアイテムは作物にあげることができます
                    </p>
                  )}
                  <Button
                    onClick={() => {
                      setShowItemRewards(false);
                      // 農学部: 初めて水アイテムを入手したらチュートリアル
                      const justGotWater = getAllRewards().some(r => r.id === "agr-water");
                      if (isCrop && justGotWater && !hasSeenAgrItemTutorial()) {
                        setShowAgrFeedGuide(true);
                        return;
                      }
                      if (stage.skipNextLocationScreen) handleNext();
                      else setShowNext(true);
                    }}
                    className={`w-full h-14 text-lg ${colorClasses.bg} hover:opacity-90`}
                  >
                    次へ進む
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              );
            })()}

            {/* 農学部: 初回アイテム入手時のチュートリアル */}
            {showAgrFeedGuide && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-4 shadow-xl animate-pulse">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-blue-900">アイテム使用チュートリアル</h2>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-4 border-blue-300 shadow-lg space-y-3">
                  <p className="text-base text-gray-800 leading-relaxed">
                    💡 アイテムを入手しました！<br />
                    画面上部の <strong className="text-green-700">作物パネル</strong> に所持中のアイテムが表示されます。
                  </p>
                  <p className="text-base text-gray-800 leading-relaxed">
                    まずは <strong className="text-blue-700">💧水</strong> を作物にあげてみましょう！<br />
                    上のアイテムをタップしてください。
                  </p>
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                    <p className="text-sm text-yellow-900">
                      ⚠️ アイテムをあげると満腹度が上がり、満タンになるとしばらくあげられなくなります。
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-block animate-bounce text-4xl">☝️</div>
                  <p className="text-sm font-semibold text-gray-600">
                    上の作物パネルから水をタップ！
                  </p>
                </div>
              </div>
            )}

            {/* 種まきフェーズ（農学部ステージ1正解後） */}
            {showSeeding && (
              <div className="space-y-6">
                {!seedingDone ? (
                  <>
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold text-green-900">
                        🌱 種まきの時間だ！
                      </h2>
                      <p className="text-lg text-gray-700">
                        畑に種を植えよう。<br />君の旅とともに育っていくぞ。
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border-4 border-green-300 shadow-lg text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-8 border-green-400 shadow-2xl bg-white flex items-center justify-center">
                          <img src="/images/tane0.png" alt="種" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSeedPlant}
                      className="w-full h-16 text-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 hover:from-green-700 hover:via-emerald-700 hover:to-lime-700 shadow-lg"
                    >
                      <span className="text-3xl mr-3">🌱</span>
                      種を植える
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold text-orange-900">
                        🎉 種を植えた！
                      </h2>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl border-4 border-orange-300 shadow-lg text-center space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-8 border-orange-400 shadow-2xl bg-white flex items-center justify-center">
                          <img src="/images/tane0.png" alt="種" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <p className="text-xl text-gray-800 font-semibold">
                        種を植えた！<br />
                        アイテムをあげて育てていこう。
                      </p>
                    </div>

                    <Button
                      onClick={handleSeedingContinue}
                      className={`w-full h-14 text-lg ${colorClasses.bg} hover:opacity-90`}
                    >
                      次へ進む
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* 回答フォーム */}
            {!showNext && !showExplanation && !showSeeding && !showItemRewards && !showAgrFeedGuide ? (
              <>
                {/* テキスト入力形式 */}
                {(!stage.type || stage.type === "text") && (
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

                {/* 選択式（間違えても正解を見せず繰り返す） */}
                {stage.type === "select" && stage.options && (
                  <div className="space-y-3">
                    {stage.options.map((option, index) => {
                      const isSelected = selectedOption === index;
                      const isCorrect = index === stage.correctIndex;

                      let btnClass = "w-full h-auto py-4 text-lg justify-start text-left";
                      if (isSelected && isCorrect && feedback === "correct") {
                        btnClass += " bg-green-500 hover:bg-green-500 text-white border-green-600";
                      } else if (isSelected && !isCorrect && feedback === "incorrect") {
                        btnClass += " bg-red-500 hover:bg-red-500 text-white border-red-600";
                      }

                      return (
                        <Button
                          key={index}
                          onClick={() => handleSelectOption(index)}
                          disabled={feedback === "correct"}
                          variant="outline"
                          className={btnClass}
                        >
                          <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {/* 複数入力ボックス形式 */}
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
                      className={`w-full h-12 text-lg ${colorClasses.bg} hover:opacity-90`}
                      disabled={multiInputs.some(v => !v.trim())}
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
                  {department.keywordMode?.enabled &&
                  currentStageId === department.keywordMode.afterStageId ? (
                    <>
                      キーワード収集へ
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  ) : department.midBattles?.some(b => b.afterStageId === currentStageId) ? (
                    <>
                      試練へ挑む
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  ) : currentStageId < department.stages.length ? (
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

      {/* 作物成長画面（フルスクリーンオーバーレイ） */}
      {showGrowthScreen && growthScreenVisual && (() => {
        const isFinalEvo = growthScreenVisual.level === 99;
        return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full space-y-6">
            <div className="text-center space-y-3">
              <div className={`inline-block rounded-full p-5 shadow-2xl animate-bounce ${isFinalEvo ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" : "bg-gradient-to-r from-yellow-400 to-orange-500"}`}>
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                {isFinalEvo ? "最終進化！" : "成長した！"}
              </h2>
            </div>

            <Card className={`shadow-2xl border-4 ${isFinalEvo ? "border-purple-500" : "border-green-400"}`}>
              <CardContent className="pt-8 pb-8 text-center space-y-5">
                <div className="flex justify-center">
                  <div className={`w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-8 shadow-2xl bg-white flex items-center justify-center ${isFinalEvo ? "border-purple-500" : "border-green-400"}`}>
                    {growthScreenVisual.image
                      ? <img src={growthScreenVisual.image} alt={growthScreenVisual.label} className="w-full h-full object-cover" />
                      : <span className="text-8xl">🌱</span>
                    }
                  </div>
                </div>
                {isFinalEvo ? (
                  <>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                      {growthScreenVisual.label}
                    </p>
                    <p className="text-base text-purple-900 font-semibold">
                      ✨ 心を受け取り、真の姿になった！
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-green-900">
                      作物が「{growthScreenVisual.label}」に成長した！
                    </p>
                    {getCropEvolutionName(cropState) && (
                      <p className="text-lg font-semibold text-purple-700">
                        ✨ {getCropEvolutionName(cropState)} に進化！
                      </p>
                    )}
                  </>
                )}

                {/* 発芽時（レベル1）に名前をつける */}
                {growthScreenVisual.level === 1 && (
                  <div className="bg-green-50 p-4 rounded-xl border-2 border-green-300 space-y-3">
                    <p className="text-sm font-semibold text-green-900">
                      🌱 作物に名前をつけよう！
                    </p>
                    <Input
                      type="text"
                      value={cropNicknameInput}
                      onChange={(e) => setCropNicknameInput(e.target.value)}
                      placeholder="例: たねまる"
                      className="text-lg h-12"
                      maxLength={10}
                    />
                    <p className="text-xs text-gray-500">あとから変更はできません</p>
                  </div>
                )}

                <Button
                  onClick={() => {
                    // 発芽時に名前を保存
                    if (growthScreenVisual.level === 1 && cropNicknameInput.trim() && departmentId) {
                      const latest = getCropState(departmentId);
                      latest.nickname = cropNicknameInput.trim();
                      saveCropState(departmentId, latest);
                      setCropStateLocal(latest);
                    }
                    setShowGrowthScreen(false);
                    setGrowthScreenVisual(null);
                    // チュートリアル中の成長 → 閉じたら次の目的地へ
                    if (showAgrFeedGuide) {
                      setShowAgrFeedGuide(false);
                      if (stage.skipNextLocationScreen) handleNext();
                      else setShowNext(true);
                    }
                  }}
                  disabled={growthScreenVisual.level === 1 && !cropNicknameInput.trim()}
                  className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  {growthScreenVisual.level === 1 ? "名前を決定！" : "戻る"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        );
      })()}
    </div>
  );
}