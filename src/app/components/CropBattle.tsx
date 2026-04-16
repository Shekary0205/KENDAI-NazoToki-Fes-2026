import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
  Swords,
  Skull,
  Trophy,
  Home,
  RotateCcw,
  Zap,
  CheckSquare,
  Square,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  getCropState,
  getCropVisual,
  getCropEvolutionName,
  getCropGrowthLevel,
  addItem,
  isCropDepartment,
  digestCrop,
  markDepartmentAsCleared,
  CROP_STAT_INFO,
  type MidBattleData,
  type MidBattleQuestion,
  type DepartmentData,
  type CropStat,
} from "../data/departments-data";
import { useBgm } from "../context/BgmContext";
import { fireCorrectEffect } from "../utils/confetti";

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const shuffleQuestionOptions = (q: MidBattleQuestion): MidBattleQuestion => {
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const newOptions = order.map(i => q.options[i]);
  const oldToNew = new Map<number, number>();
  order.forEach((oldIdx, newIdx) => oldToNew.set(oldIdx, newIdx));
  return {
    ...q,
    options: newOptions,
    correctIndex: q.correctIndex !== undefined ? oldToNew.get(q.correctIndex) : undefined,
    correctIndices: q.correctIndices?.map(i => oldToNew.get(i) ?? i),
  };
};

type BattleState = "intro" | "question" | "correct" | "incorrect" | "explanation" | "victory" | "defeat";

interface CropBattleProps {
  departmentId: string;
  battleData: MidBattleData;
  department: DepartmentData;
}

export default function CropBattle({ departmentId, battleData, department }: CropBattleProps) {
  const navigate = useNavigate();
  const cropState = getCropState(departmentId);
  const playerVisual = getCropVisual(cropState);
  const playerEvoName = getCropEvolutionName(cropState);
  const playerName = playerEvoName ?? playerVisual.label;
  const enemyName = battleData.enemyCropName ?? battleData.enemyName;
  const enemyImage = battleData.enemyCropImage ?? battleData.enemyImage;

  const [battleState, setBattleState] = useState<BattleState>("intro");
  const [questionQueue, setQuestionQueue] = useState<MidBattleQuestion[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(battleData.playerMaxHp);
  const [enemyHp, setEnemyHp] = useState(battleData.enemyMaxHp);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checkedOptions, setCheckedOptions] = useState<Set<number>>(new Set());
  const [checkboxSubmitted, setCheckboxSubmitted] = useState(false);
  const [showDamage, setShowDamage] = useState<"player" | "enemy" | null>(null);
  const { switchTrack } = useBgm();
  const wonRef = useRef(false);

  useEffect(() => {
    setQuestionQueue(
      (battleData.randomOrder ? shuffleArray(battleData.questions) : [...battleData.questions])
        .map(shuffleQuestionOptions)
    );
  }, [battleData]);

  useEffect(() => {
    switchTrack("trainer");
    return () => { if (!wonRef.current) switchTrack("field"); };
  }, [switchTrack]);

  const currentQuestion = questionQueue[queueIndex];

  const handleStartBattle = () => {
    const track = (battleData.battleBgm || "battle") as import("../context/BgmContext").BgmTrack;
    switchTrack(track);
    setBattleState("question");
  };

  const advanceToNextQuestion = (eHp: number, pHp: number) => {
    if (eHp <= 0) { switchTrack("victory"); setBattleState("victory"); return; }
    if (pHp <= 0) { switchTrack("trainer"); setBattleState("defeat"); return; }
    if (queueIndex < questionQueue.length - 1) {
      setQueueIndex(i => i + 1);
      setSelectedOption(null);
      setCheckedOptions(new Set());
      setCheckboxSubmitted(false);
      setBattleState("question");
    } else {
      if (enemyHp < playerHp) { switchTrack("victory"); setBattleState("victory"); }
      else { switchTrack("trainer"); setBattleState("defeat"); }
    }
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setBattleState("correct"); fireCorrectEffect(); setShowDamage("enemy");
      const newEHp = Math.max(0, enemyHp - battleData.damageToEnemy);
      setEnemyHp(newEHp);
      setTimeout(() => { setShowDamage(null); currentQuestion.explanation ? setBattleState("explanation") : advanceToNextQuestion(newEHp, playerHp); }, 1800);
    } else {
      setBattleState("incorrect"); setShowDamage("player");
      const newPHp = Math.max(0, playerHp - battleData.damageToPlayer);
      setPlayerHp(newPHp);
      setTimeout(() => { setShowDamage(null); currentQuestion.explanation ? setBattleState("explanation") : advanceToNextQuestion(enemyHp, newPHp); }, 1800);
    }
  };

  const handleToggleCheckbox = (index: number) => {
    if (checkboxSubmitted) return;
    setCheckedOptions(prev => { const n = new Set(prev); n.has(index) ? n.delete(index) : n.add(index); return n; });
  };

  const handleSubmitCheckbox = () => {
    if (checkboxSubmitted) return;
    setCheckboxSubmitted(true);
    const correctSet = new Set(currentQuestion.correctIndices || []);
    const isCorrect = checkedOptions.size === correctSet.size && [...checkedOptions].every(i => correctSet.has(i));
    if (isCorrect) {
      setBattleState("correct"); fireCorrectEffect(); setShowDamage("enemy");
      const newEHp = Math.max(0, enemyHp - battleData.damageToEnemy);
      setEnemyHp(newEHp);
      setTimeout(() => { setShowDamage(null); currentQuestion.explanation ? setBattleState("explanation") : advanceToNextQuestion(newEHp, playerHp); }, 1800);
    } else {
      setBattleState("incorrect"); setShowDamage("player");
      const newPHp = Math.max(0, playerHp - battleData.damageToPlayer);
      setPlayerHp(newPHp);
      setTimeout(() => { setShowDamage(null); currentQuestion.explanation ? setBattleState("explanation") : advanceToNextQuestion(enemyHp, newPHp); }, 1800);
    }
  };

  const handleRetry = () => {
    switchTrack("trainer");
    setPlayerHp(battleData.playerMaxHp);
    setEnemyHp(battleData.enemyMaxHp);
    setQuestionQueue((battleData.randomOrder ? shuffleArray(battleData.questions) : [...battleData.questions]).map(shuffleQuestionOptions));
    setQueueIndex(0); setSelectedOption(null); setCheckedOptions(new Set()); setCheckboxSubmitted(false);
    setBattleState("intro");
  };

  const handleVictory = () => {
    wonRef.current = true;
    if (battleData.rewardItem) addItem(battleData.rewardItem);
    if (battleData.rewardItems) battleData.rewardItems.forEach(i => addItem(i));
    if (battleData.recoversFullness && isCropDepartment(departmentId)) {
      const c = getCropState(departmentId);
      if (c.seeded) digestCrop(departmentId);
    }
    const isLastStage = battleData.afterStageId >= department.stages.length;
    if (isLastStage) {
      markDepartmentAsCleared(departmentId);
      navigate(`/department/${departmentId}/complete`);
    } else {
      const nextStageId = battleData.nextStageId ?? battleData.afterStageId + 1;
      navigate(`/department/${departmentId}/stage/${nextStageId}`);
    }
  };

  const playerHpPct = (playerHp / battleData.playerMaxHp) * 100;
  const enemyHpPct = (enemyHp / battleData.enemyMaxHp) * 100;

  // ===== バトルフィールド（共通） =====
  const BattleField = () => (
    <div className="relative bg-gradient-to-b from-sky-200 via-green-200 to-green-400 rounded-2xl overflow-hidden h-72 shadow-inner">
      {/* 地面ライン */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-600/40 to-transparent" />

      {/* 敵作物（右上） */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
        <div className="bg-white/85 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md min-w-[140px]">
          <p className="font-bold text-sm text-red-900 text-right">{enemyName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-600">HP</span>
            <div className="flex-1 bg-gray-300 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full transition-all duration-700 ${enemyHpPct > 50 ? "bg-green-500" : enemyHpPct > 20 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${enemyHpPct}%` }} />
            </div>
          </div>
          <p className="text-[10px] text-gray-500 text-right mt-0.5">{enemyHp}/{battleData.enemyMaxHp}</p>
        </div>
        <div className={`w-28 h-28 rounded-full bg-white/50 shadow-xl flex items-center justify-center ${showDamage === "enemy" ? "animate-shake" : ""}`}>
          <img src={enemyImage} alt={enemyName} className="w-24 h-24 object-contain" style={{ filter: "hue-rotate(180deg) brightness(0.85) saturate(1.3)" }} />
        </div>
      </div>

      {/* 自作物（左下） */}
      <div className="absolute bottom-3 left-3 flex flex-col items-start gap-1">
        <div className={`w-36 h-36 rounded-full bg-white/60 shadow-xl flex items-center justify-center ${showDamage === "player" ? "animate-shake" : ""}`}>
          {playerVisual.image
            ? <img src={playerVisual.image} alt={playerName} className="w-32 h-32 object-contain" />
            : <span className="text-7xl">🌱</span>
          }
        </div>
        <div className="bg-white/85 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md min-w-[160px]">
          <div className="flex items-baseline justify-between">
            <p className="font-bold text-sm text-green-900">{playerName}</p>
            {playerEvoName && <Badge className="text-[9px] px-1.5 py-0 bg-green-100 text-green-800 ml-1">進化</Badge>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-600">HP</span>
            <div className="flex-1 bg-gray-300 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full transition-all duration-700 ${playerHpPct > 50 ? "bg-green-500" : playerHpPct > 20 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${playerHpPct}%` }} />
            </div>
          </div>
          <p className="text-[10px] text-gray-500 text-right mt-0.5">{playerHp}/{battleData.playerMaxHp}</p>
        </div>
      </div>
    </div>
  );

  // ===== イントロ =====
  if (battleState === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-green-900">作物バトル！</h1>
            <p className="text-lg text-gray-700">きみの作物で敵を倒せ！</p>
          </div>

          {/* VS表示 */}
          <Card className="shadow-2xl border-4 border-green-400 overflow-hidden">
            <div className="flex items-center justify-around p-6 bg-gradient-to-r from-green-50 to-red-50">
              {/* 自作物 */}
              <div className="text-center space-y-2">
                <div className="w-28 h-28 mx-auto rounded-full bg-white border-4 border-green-400 shadow-lg flex items-center justify-center overflow-hidden">
                  {playerVisual.image
                    ? <img src={playerVisual.image} alt={playerName} className="w-full h-full object-cover" />
                    : <span className="text-5xl">🌱</span>
                  }
                </div>
                <p className="font-bold text-green-900 text-sm">{playerName}</p>
                <div className="flex items-center justify-center gap-2 text-xs">
                  {(["kindness", "strength", "wisdom"] as CropStat[]).map(s => (
                    <span key={s} className={`font-semibold ${cropState[s] >= 3 ? CROP_STAT_INFO[s].color : "text-gray-400"}`}>
                      {CROP_STAT_INFO[s].icon}{cropState[s]}
                    </span>
                  ))}
                </div>
                <Badge className="bg-blue-600 text-white">HP: {battleData.playerMaxHp}</Badge>
              </div>

              <div className="text-5xl font-black text-red-600 animate-pulse">VS</div>

              {/* 敵作物 */}
              <div className="text-center space-y-2">
                <div className="w-28 h-28 mx-auto rounded-full bg-white border-4 border-red-400 shadow-lg flex items-center justify-center overflow-hidden">
                  <img src={enemyImage} alt={enemyName} className="w-24 h-24 object-contain" style={{ filter: "hue-rotate(180deg) brightness(0.85) saturate(1.3)" }} />
                </div>
                <p className="font-bold text-red-900 text-sm">{enemyName}</p>
                <Badge className="bg-red-600 text-white">HP: {battleData.enemyMaxHp}</Badge>
              </div>
            </div>

            <CardContent className="space-y-4 pt-6">
              <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
                <h3 className="font-bold text-amber-900 mb-2">⚔️ バトルルール</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• 正解で敵に <strong className="text-red-600">{battleData.damageToEnemy}ダメージ</strong></li>
                  <li>• 不正解で <strong className="text-blue-600">{battleData.damageToPlayer}ダメージ</strong></li>
                  <li>• 敵のHPを0にすれば勝利！</li>
                </ul>
              </div>
              <Button onClick={handleStartBattle} className="w-full h-14 text-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Swords className="w-6 h-6 mr-2" />
                バトル開始！
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== 勝利 =====
  if (battleState === "victory") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-yellow-400 rounded-full p-8 shadow-2xl animate-bounce inline-block">
              <Trophy className="w-20 h-20 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">勝利！</h1>
          </div>
          <Card className="shadow-2xl border-4 border-yellow-400">
            <CardContent className="space-y-6 pt-8 text-center">
              <p className="text-2xl font-bold">{enemyName}を倒した！</p>
              <div className="w-32 h-32 mx-auto rounded-full bg-white border-4 border-green-400 shadow-lg flex items-center justify-center overflow-hidden">
                {playerVisual.image
                  ? <img src={playerVisual.image} alt={playerName} className="w-full h-full object-cover" />
                  : <span className="text-6xl">🌱</span>
                }
              </div>
              <p className="text-lg text-green-800 font-semibold">{playerName} の勝ち！</p>

              {(battleData.rewardItem || battleData.rewardItems) && (
                <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-300 space-y-2">
                  <div className="flex justify-center"><Sparkles className="w-6 h-6 text-purple-600" /></div>
                  <p className="font-bold text-purple-900">アイテム入手！</p>
                  {battleData.rewardItem && (
                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-purple-200 mx-auto max-w-xs">
                      <span className="text-2xl">{battleData.rewardItem.icon}</span>
                      <span className="font-bold text-sm">{battleData.rewardItem.name}</span>
                    </div>
                  )}
                  {battleData.rewardItems?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-purple-200 mx-auto max-w-xs">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-bold text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {battleData.nextLocationHint && (
                <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-300">
                  <p className="text-lg font-semibold text-gray-800">{battleData.nextLocationHint}</p>
                </div>
              )}

              <Button onClick={handleVictory} className="w-full h-14 text-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                <ArrowRight className="w-6 h-6 mr-2" />
                次へ進む
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== 敗北 =====
  if (battleState === "defeat") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-100 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-gray-500 rounded-full p-8 shadow-2xl inline-block"><Skull className="w-20 h-20 text-white" /></div>
            <h1 className="text-5xl font-bold text-gray-700">敗北...</h1>
          </div>
          <Card className="shadow-2xl border-2 border-gray-400">
            <CardContent className="space-y-6 pt-8 text-center">
              <p className="text-2xl font-bold">{enemyName}に敗れた...</p>
              <div className="space-y-3">
                <Button onClick={handleRetry} className="w-full h-14 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <RotateCcw className="w-6 h-6 mr-2" />再戦する
                </Button>
                <Button onClick={() => navigate("/select")} variant="outline" className="w-full h-12 text-lg">
                  <Home className="w-5 h-5 mr-2" />学部選択に戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== バトル画面 =====
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 p-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* バトルフィールド */}
        <BattleField />

        {/* 解説 */}
        {battleState === "explanation" && currentQuestion.explanation && (
          <Card className="shadow-xl border-2 border-green-400">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-50">
              <div className="flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-green-700" />
                <CardTitle className="text-2xl text-green-900">解説</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
                <h4 className="font-bold text-amber-900 text-sm mb-2">正解</h4>
                <p className="text-lg font-bold text-gray-900">
                  {currentQuestion.type === "checkbox"
                    ? (currentQuestion.correctIndices || []).map(i => currentQuestion.options[i]).join(" / ")
                    : currentQuestion.options[currentQuestion.correctIndex ?? 0]}
                </p>
              </div>
              <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">{currentQuestion.explanation}</p>
              <Button onClick={() => advanceToNextQuestion(enemyHp, playerHp)} className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600">
                次の問題へ
              </Button>
            </CardContent>
          </Card>
        )}

        {/* クイズカード */}
        {battleState !== "explanation" && (
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
              <CardTitle className="text-xl text-center whitespace-pre-line">{currentQuestion.question}</CardTitle>
              {currentQuestion.type === "checkbox" && (
                <p className="text-center text-gray-600 mt-2">正しいものをすべて選んでください</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {currentQuestion.type !== "checkbox" && (
                <div className="grid gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = index === currentQuestion.correctIndex;
                    const showResult = selectedOption !== null;
                    let cls = "h-auto py-4 text-lg justify-start text-left whitespace-normal";
                    if (showResult) {
                      if (isSelected && isCorrect) cls += " bg-green-500 hover:bg-green-500 text-white border-green-600";
                      else if (isSelected && !isCorrect) cls += " bg-red-500 hover:bg-red-500 text-white border-red-600";
                      else if (isCorrect) cls += " bg-green-100 border-green-400";
                    }
                    return (
                      <Button key={index} onClick={() => handleSelectOption(index)} disabled={selectedOption !== null}
                        variant={isSelected ? "default" : "outline"} className={cls}>
                        <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>{option}
                      </Button>
                    );
                  })}
                </div>
              )}
              {currentQuestion.type === "checkbox" && (
                <div className="grid gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const isChecked = checkedOptions.has(index);
                    const correctSet = new Set(currentQuestion.correctIndices || []);
                    const isCorrectOption = correctSet.has(index);
                    const showResult = checkboxSubmitted;
                    let cls = "h-auto py-4 text-lg justify-start text-left whitespace-normal";
                    if (showResult) {
                      if (isChecked && isCorrectOption) cls += " bg-green-500 hover:bg-green-500 text-white border-green-600";
                      else if (isChecked && !isCorrectOption) cls += " bg-red-500 hover:bg-red-500 text-white border-red-600";
                      else if (isCorrectOption) cls += " bg-green-100 border-green-400";
                    }
                    return (
                      <Button key={index} onClick={() => handleToggleCheckbox(index)} disabled={checkboxSubmitted}
                        variant={isChecked ? "default" : "outline"} className={cls}>
                        {isChecked ? <CheckSquare className="w-5 h-5 mr-3 flex-shrink-0" /> : <Square className="w-5 h-5 mr-3 flex-shrink-0" />}
                        {option}
                      </Button>
                    );
                  })}
                  {!checkboxSubmitted && (
                    <Button onClick={handleSubmitCheckbox} disabled={checkedOptions.size === 0}
                      className="w-full h-12 text-lg mt-2 bg-gradient-to-r from-blue-600 to-purple-600">
                      回答する
                    </Button>
                  )}
                </div>
              )}
              {battleState === "correct" && (
                <Alert className="bg-green-50 border-green-300">
                  <Zap className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 font-bold text-lg">
                    正解！ {enemyName}に{battleData.damageToEnemy}ダメージ！
                  </AlertDescription>
                </Alert>
              )}
              {battleState === "incorrect" && (
                <Alert className="bg-red-50 border-red-300">
                  <Skull className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-800 font-bold text-lg">
                    不正解... {playerName}が{battleData.damageToPlayer}ダメージを受けた！
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.5s; }
      `}</style>
    </div>
  );
}
