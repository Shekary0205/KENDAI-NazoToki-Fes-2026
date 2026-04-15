import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
  Swords,
  Heart,
  Skull,
  Trophy,
  Home,
  Zap,
  CheckSquare,
  Square,
  BookOpen,
  Sparkles,
  Flame,
  Heart as HeartIcon,
  ArrowRight,
} from "lucide-react";
import {
  getDepartmentById,
  getFallbackBattleQuestions,
  getObtainedItems,
  hasItem,
  markDepartmentAsCleared,
  type MidBattleQuestion,
  type ItemData,
} from "../data/departments-data";
import { useBgm } from "../context/BgmContext";
import { fireCorrectEffect } from "../utils/confetti";

// ===== Helpers =====
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
    correctIndex:
      q.correctIndex !== undefined ? oldToNew.get(q.correctIndex) : undefined,
    correctIndices: q.correctIndices?.map(i => oldToNew.get(i) ?? i),
  };
};

type BattleState =
  | "intro"
  | "question"
  | "correct"
  | "incorrect"
  | "explanation"
  | "defeat"
  | "finishingBlow"
  | "finishingAnimation"
  | "victory";

export default function FinalBattle() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const department = getDepartmentById(departmentId || "");
  const finalBattle = department?.finalBattle;

  const [battleState, setBattleState] = useState<BattleState>("intro");
  const [questionQueue, setQuestionQueue] = useState<MidBattleQuestion[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checkedOptions, setCheckedOptions] = useState<Set<number>>(new Set());
  const [checkboxSubmitted, setCheckboxSubmitted] = useState(false);
  const [showDamage, setShowDamage] = useState<"player" | "enemy" | null>(null);
  const [inventory, setInventory] = useState<ItemData[]>([]);
  const { switchTrack } = useBgm();
  const wonRef = useRef(false);

  // 最初のキューを準備（メイン問題 + フォールバック問題）
  const buildQueue = useMemo(() => {
    return () => {
      if (!finalBattle || !departmentId) return [];
      const main = shuffleArray(finalBattle.questions).map(shuffleQuestionOptions);
      const fallbackPool = getFallbackBattleQuestions(departmentId);
      // メインに含まれる問題は除外
      const mainQuestionSet = new Set(finalBattle.questions.map(q => q.question));
      const fallback = shuffleArray(
        fallbackPool.filter(q => !mainQuestionSet.has(q.question))
      ).map(shuffleQuestionOptions);
      return [...main, ...fallback];
    };
  }, [finalBattle, departmentId]);

  useEffect(() => {
    if (finalBattle) {
      setPlayerHp(finalBattle.playerMaxHp);
      setEnemyHp(finalBattle.enemyMaxHp);
      setQuestionQueue(buildQueue());
      setQueueIndex(0);
      setCorrectCount(0);
      setInventory(getObtainedItems());
    }
  }, [finalBattle, buildQueue]);

  useEffect(() => {
    switchTrack("trainer");
    return () => {
      if (!wonRef.current) {
        switchTrack("field");
      }
    };
  }, [switchTrack]);

  if (!department || !finalBattle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>最終戦闘データが見つかりません</CardTitle>
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

  const currentQuestion = questionQueue[queueIndex];

  const handleStartBattle = () => {
    const track = (finalBattle.battleBgm || "finalBattle") as import("../context/BgmContext").BgmTrack;
    switchTrack(track);
    setBattleState("question");
  };

  const advanceToNextQuestion = (enemyHpAfter: number, playerHpAfter: number) => {
    // 敵HP 0 → トドメ演出へ
    if (enemyHpAfter <= 0) {
      setBattleState("finishingBlow");
      return;
    }
    // プレイヤーHP 0 → 敗北（復活可能）
    if (playerHpAfter <= 0) {
      switchTrack("trainer");
      setBattleState("defeat");
      return;
    }
    // 次の問題がない → キューを拡張（フォールバックで補充）
    if (queueIndex >= questionQueue.length - 1) {
      const extra = buildQueue();
      setQuestionQueue(prev => [...prev, ...extra]);
    }
    setQueueIndex(i => i + 1);
    setSelectedOption(null);
    setCheckedOptions(new Set());
    setCheckboxSubmitted(false);
    setBattleState("question");
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);

    const isCorrect = index === currentQuestion.correctIndex;

    if (isCorrect) {
      setBattleState("correct");
      fireCorrectEffect();
      setShowDamage("enemy");
      const newEnemyHp = Math.max(0, enemyHp - finalBattle.damageToEnemy);
      setEnemyHp(newEnemyHp);
      setCorrectCount(c => c + 1);
      setTimeout(() => {
        setShowDamage(null);
        if (currentQuestion.explanation) {
          setBattleState("explanation");
        } else {
          advanceToNextQuestion(newEnemyHp, playerHp);
        }
      }, 1800);
    } else {
      setBattleState("incorrect");
      setShowDamage("player");
      const newPlayerHp = Math.max(0, playerHp - finalBattle.damageToPlayer);
      setPlayerHp(newPlayerHp);
      setTimeout(() => {
        setShowDamage(null);
        if (currentQuestion.explanation) {
          setBattleState("explanation");
        } else {
          advanceToNextQuestion(enemyHp, newPlayerHp);
        }
      }, 1800);
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

    const correctSet = new Set(currentQuestion.correctIndices || []);
    const isCorrect =
      checkedOptions.size === correctSet.size &&
      [...checkedOptions].every(i => correctSet.has(i));

    if (isCorrect) {
      setBattleState("correct");
      fireCorrectEffect();
      setShowDamage("enemy");
      const newEnemyHp = Math.max(0, enemyHp - finalBattle.damageToEnemy);
      setEnemyHp(newEnemyHp);
      setCorrectCount(c => c + 1);
      setTimeout(() => {
        setShowDamage(null);
        if (currentQuestion.explanation) {
          setBattleState("explanation");
        } else {
          advanceToNextQuestion(newEnemyHp, playerHp);
        }
      }, 1800);
    } else {
      setBattleState("incorrect");
      setShowDamage("player");
      const newPlayerHp = Math.max(0, playerHp - finalBattle.damageToPlayer);
      setPlayerHp(newPlayerHp);
      setTimeout(() => {
        setShowDamage(null);
        if (currentQuestion.explanation) {
          setBattleState("explanation");
        } else {
          advanceToNextQuestion(enemyHp, newPlayerHp);
        }
      }, 1800);
    }
  };

  // 教師の心で復活
  const handleRevive = () => {
    if (!finalBattle.reviveItemId || !hasItem(finalBattle.reviveItemId)) return;
    // アイテムは消費しない（何度でも復活可能）
    setPlayerHp(finalBattle.playerMaxHp);
    setSelectedOption(null);
    setCheckedOptions(new Set());
    setCheckboxSubmitted(false);
    const track = (finalBattle.battleBgm || "finalBattle") as import("../context/BgmContext").BgmTrack;
    switchTrack(track);
    setBattleState("question");
  };

  // 教鞭でトドメ
  const handleFinish = () => {
    if (!finalBattle.finishingItemId || !hasItem(finalBattle.finishingItemId)) return;
    setBattleState("finishingAnimation");
    setShowDamage("enemy");
    // 特別演出を見せてから勝利
    setTimeout(() => setShowDamage(null), 1500);
    setTimeout(() => {
      switchTrack("victory");
      setBattleState("victory");
    }, 2400);
  };

  const handleVictory = () => {
    wonRef.current = true;
    markDepartmentAsCleared(departmentId!);
    navigate(`/department/${departmentId}/complete`);
  };

  const playerHpPercentage = (playerHp / finalBattle.playerMaxHp) * 100;
  const enemyHpPercentage = (enemyHp / finalBattle.enemyMaxHp) * 100;
  const canRevive = finalBattle.reviveItemId ? hasItem(finalBattle.reviveItemId) : false;
  const canFinish = finalBattle.finishingItemId ? hasItem(finalBattle.finishingItemId) : false;
  const reviveItem = inventory.find(i => i.id === finalBattle.reviveItemId);
  const finishItem = inventory.find(i => i.id === finalBattle.finishingItemId);

  // ===== イントロ画面 =====
  if (battleState === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-red-100 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-red-600 rounded-full p-6 shadow-2xl animate-pulse">
                <Flame className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-red-900">
              最終試練！
            </h1>
            <p className="text-xl text-gray-700">
              {finalBattle.enemyName}が現れた！
            </p>
          </div>

          <Card className="shadow-2xl border-4 border-red-400">
            <CardHeader className="bg-gradient-to-r from-red-100 to-orange-100">
              <CardTitle className="text-3xl text-center text-red-900">
                {finalBattle.enemyName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-300">
                <h3 className="font-bold text-lg text-amber-900 mb-3">⚔️ 最終戦闘ルール</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 正解すると敵に<strong className="text-red-600">{finalBattle.damageToEnemy}ダメージ</strong></li>
                  <li>• 不正解だと<strong className="text-blue-600">{finalBattle.damageToPlayer}ダメージ</strong></li>
                  <li>• <strong>{finalBattle.requiredCorrectCount}問正解</strong>で勝利！</li>
                  <li>• 敗北しても <strong className="text-pink-600">❤️ 教師の心</strong> があれば何度でも復活可能</li>
                  <li>• 敵HPを0にしたら、<strong className="text-purple-700">🪄 教鞭</strong> でトドメを刺せ！</li>
                </ul>
              </div>

              <div className="flex items-center justify-around p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-6 h-6 text-blue-600" />
                    <span className="font-bold text-blue-900">あなた</span>
                  </div>
                  <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                    HP: {finalBattle.playerMaxHp}
                  </Badge>
                </div>
                <Swords className="w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Skull className="w-6 h-6 text-red-600" />
                    <span className="font-bold text-red-900">敵</span>
                  </div>
                  <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                    HP: {finalBattle.enemyMaxHp}
                  </Badge>
                </div>
              </div>

              <Button
                onClick={handleStartBattle}
                className="w-full h-14 text-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700"
              >
                <Flame className="w-6 h-6 mr-2" />
                最終試練開始！
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== 敗北画面（復活可能） =====
  if (battleState === "defeat") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-300 via-gray-100 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gray-600 rounded-full p-8 shadow-2xl">
                <Skull className="w-20 h-20 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-700">倒れた...</h1>
          </div>

          <Card className="shadow-2xl border-4 border-pink-400">
            <CardContent className="space-y-6 pt-8">
              <div className="text-center space-y-3">
                <p className="text-2xl font-bold text-gray-800">
                  {finalBattle.enemyName}の一撃で倒された...
                </p>
                {canRevive ? (
                  <p className="text-lg text-pink-700 font-semibold">
                    しかし、「教師の心」がまだ燃えている！
                  </p>
                ) : (
                  <p className="text-lg text-gray-600">
                    復活するには「教師の心」が必要だ...
                  </p>
                )}
              </div>

              {canRevive && reviveItem && (
                <div className="bg-pink-50 p-5 rounded-xl border-2 border-pink-300 text-center">
                  <div className="text-6xl mb-2 animate-pulse">{reviveItem.icon}</div>
                  <p className="text-lg font-bold text-pink-900">{reviveItem.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{reviveItem.description}</p>
                </div>
              )}

              <div className="space-y-3">
                {canRevive ? (
                  <Button
                    onClick={handleRevive}
                    className="w-full h-14 text-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    <HeartIcon className="w-6 h-6 mr-2" />
                    教師の心で復活する！
                  </Button>
                ) : null}

                <Button
                  onClick={() => navigate(`/department/${departmentId}/keyword-hub`)}
                  variant="outline"
                  className="w-full h-12 text-lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  キーワードハブに戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== トドメ演出（教鞭で一撃） =====
  if (battleState === "finishingBlow") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-purple-600 rounded-full p-8 shadow-2xl animate-pulse">
                <Zap className="w-20 h-20 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-purple-900 animate-pulse">
              チャンス到来！
            </h1>
            <p className="text-2xl text-gray-800 font-bold">
              {finalBattle.enemyName} は瀕死だ！
            </p>
          </div>

          <Card className="shadow-2xl border-4 border-purple-500">
            <CardContent className="space-y-6 pt-8 text-center">
              <p className="text-xl text-gray-800 font-bold leading-relaxed">
                今こそ <span className="text-purple-700">🪄 教鞭</span> でトドメを刺せ！
              </p>

              {canFinish && finishItem && (
                <div className="bg-purple-50 p-6 rounded-xl border-4 border-purple-400 animate-pulse">
                  <div className="text-7xl mb-3">{finishItem.icon}</div>
                  <p className="text-2xl font-bold text-purple-900">{finishItem.name}</p>
                  <p className="text-sm text-gray-600 mt-2">{finishItem.description}</p>
                </div>
              )}

              {canFinish ? (
                <Button
                  onClick={handleFinish}
                  className="w-full h-16 text-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 shadow-lg"
                >
                  <Sparkles className="w-7 h-7 mr-2" />
                  教鞭を振るう！
                </Button>
              ) : (
                <Alert className="bg-red-50 border-red-300">
                  <AlertDescription className="text-red-800 font-bold">
                    「教鞭」が必要です。キーワード1の戦闘で入手できます。
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== 特別演出（トドメアニメーション） =====
  if (battleState === "finishingAnimation") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-2xl h-96 flex items-center justify-center">
          {/* 光のバースト */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-30 blur-3xl animate-ping" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-60 h-60 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-50 blur-2xl animate-pulse" />
          </div>

          {/* 教鞭アイコン */}
          <div className="relative text-9xl animate-[finishingStrike_1.5s_ease-out]">
            🪄
          </div>

          {/* テキスト */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-5xl font-bold text-white drop-shadow-[0_0_12px_rgba(255,200,50,0.9)] animate-pulse">
              トドメの一撃！
            </p>
          </div>
        </div>

        <style>{`
          @keyframes finishingStrike {
            0%   { transform: scale(0.3) rotate(-45deg); opacity: 0; }
            30%  { transform: scale(1.5) rotate(15deg); opacity: 1; }
            60%  { transform: scale(1.1) rotate(-5deg); }
            100% { transform: scale(1.3) rotate(0deg); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ===== 勝利画面 =====
  if (battleState === "victory") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-yellow-400 rounded-full p-8 shadow-2xl animate-bounce">
                <Trophy className="w-20 h-20 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
              完全勝利！
            </h1>
          </div>

          <Card className="shadow-2xl border-4 border-yellow-400">
            <CardContent className="space-y-6 pt-8 text-center">
              <p className="text-2xl font-bold text-gray-800">
                {finalBattle.enemyName}を倒した！
              </p>
              {finalBattle.victoryMessage && (
                <p className="text-lg text-gray-700">{finalBattle.victoryMessage}</p>
              )}

              <Button
                onClick={handleVictory}
                className="w-full h-14 text-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <ArrowRight className="w-6 h-6 mr-2" />
                次へ進む
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== バトル画面 =====
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-purple-50 to-orange-50 p-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ステータス */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className={`${showDamage === "player" ? "animate-shake border-4 border-red-500" : ""}`}>
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-lg">あなた</CardTitle>
                </div>
                <Badge className="bg-blue-600 text-white">
                  {playerHp} / {finalBattle.playerMaxHp}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Progress value={playerHpPercentage} className="h-6" />
            </CardContent>
          </Card>

          <Card className={`${showDamage === "enemy" ? "animate-shake border-4 border-yellow-500" : ""}`}>
            <CardHeader className="bg-gradient-to-r from-red-100 to-red-50 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skull className="w-6 h-6 text-red-600" />
                  <CardTitle className="text-lg">{finalBattle.enemyName}</CardTitle>
                </div>
                <Badge className="bg-red-600 text-white">
                  {enemyHp} / {finalBattle.enemyMaxHp}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Progress value={enemyHpPercentage} className="h-6" />
            </CardContent>
          </Card>
        </div>

        {/* 進捗表示 */}
        <div className="text-center">
          <Badge variant="secondary" className="text-base px-4 py-2">
            正解数: {correctCount} / {finalBattle.requiredCorrectCount}
          </Badge>
        </div>

        {/* 解説画面 */}
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
                    ? (currentQuestion.correctIndices || [])
                        .map(i => currentQuestion.options[i])
                        .join(" / ")
                    : currentQuestion.options[currentQuestion.correctIndex ?? 0]}
                </p>
              </div>
              <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">
                {currentQuestion.explanation}
              </p>
              <Button
                onClick={() => advanceToNextQuestion(enemyHp, playerHp)}
                className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                次の問題へ
              </Button>
            </CardContent>
          </Card>
        )}

        {/* クイズカード */}
        {battleState !== "explanation" && (
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50">
              <CardTitle className="text-xl text-center whitespace-pre-line">
                {currentQuestion.question}
              </CardTitle>
              {currentQuestion.type === "checkbox" && (
                <p className="text-center text-gray-600 mt-2">
                  正しいものをすべて選んでください
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {currentQuestion.type !== "checkbox" && (
                <div className="grid gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = index === currentQuestion.correctIndex;
                    const showResult = selectedOption !== null;

                    let buttonClass = "h-auto py-4 text-lg justify-start text-left whitespace-normal";
                    if (showResult) {
                      if (isSelected && isCorrect) {
                        buttonClass += " bg-green-500 hover:bg-green-500 text-white border-green-600";
                      } else if (isSelected && !isCorrect) {
                        buttonClass += " bg-red-500 hover:bg-red-500 text-white border-red-600";
                      } else if (isCorrect) {
                        buttonClass += " bg-green-100 border-green-400";
                      }
                    }

                    return (
                      <Button
                        key={index}
                        onClick={() => handleSelectOption(index)}
                        disabled={selectedOption !== null}
                        variant={isSelected ? "default" : "outline"}
                        className={buttonClass}
                      >
                        <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                        {option}
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

                    let buttonClass = "h-auto py-4 text-lg justify-start text-left whitespace-normal";
                    if (showResult) {
                      if (isChecked && isCorrectOption) {
                        buttonClass += " bg-green-500 hover:bg-green-500 text-white border-green-600";
                      } else if (isChecked && !isCorrectOption) {
                        buttonClass += " bg-red-500 hover:bg-red-500 text-white border-red-600";
                      } else if (isCorrectOption) {
                        buttonClass += " bg-green-100 border-green-400";
                      }
                    }

                    return (
                      <Button
                        key={index}
                        onClick={() => handleToggleCheckbox(index)}
                        disabled={checkboxSubmitted}
                        variant={isChecked ? "default" : "outline"}
                        className={buttonClass}
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
                      className="w-full h-12 text-lg mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      回答する
                    </Button>
                  )}
                </div>
              )}

              {battleState === "correct" && (
                <Alert className="bg-green-50 border-green-300">
                  <Zap className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 font-bold text-lg">
                    正解！ 敵に{finalBattle.damageToEnemy}ダメージ！
                  </AlertDescription>
                </Alert>
              )}

              {battleState === "incorrect" && (
                <Alert className="bg-red-50 border-red-300">
                  <Skull className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-800 font-bold text-lg">
                    不正解... {finalBattle.damageToPlayer}ダメージを受けた！
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
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
