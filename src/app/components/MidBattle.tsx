import { useState, useEffect, useRef } from "react";
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
  RotateCcw,
  Zap,
  CheckSquare,
  Square,
  BookOpen,
  ArrowRight,
  MapPin
} from "lucide-react";
import { getDepartmentById, addItem, isCropDepartment, getCropState, digestCrop, type MidBattleQuestion } from "../data/departments-data";
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

/** 選択肢をシャッフルし、correctIndex / correctIndices を再マップする */
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

type BattleState = "intro" | "question" | "correct" | "incorrect" | "explanation" | "victory" | "defeat";

export default function MidBattle() {
  const { departmentId, battleId } = useParams<{ departmentId: string; battleId: string }>();
  const navigate = useNavigate();
  const department = getDepartmentById(departmentId || "");
  const battleData = department?.midBattles?.find(b => b.id === parseInt(battleId || "0"));

  const [battleState, setBattleState] = useState<BattleState>("intro");
  const [questionQueue, setQuestionQueue] = useState<MidBattleQuestion[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checkedOptions, setCheckedOptions] = useState<Set<number>>(new Set());
  const [checkboxSubmitted, setCheckboxSubmitted] = useState(false);
  const [showDamage, setShowDamage] = useState<"player" | "enemy" | null>(null);
  const { switchTrack } = useBgm();
  const wonRef = useRef(false);

  useEffect(() => {
    if (battleData) {
      setPlayerHp(battleData.playerMaxHp);
      setEnemyHp(battleData.enemyMaxHp);
      const ordered = battleData.randomOrder
        ? shuffleArray(battleData.questions)
        : [...battleData.questions];
      setQuestionQueue(ordered.map(shuffleQuestionOptions));
      setQueueIndex(0);
      setCorrectCount(0);
      setWrongCount(0);
    }
  }, [battleData]);

  useEffect(() => {
    switchTrack("trainer");
    return () => {
      if (!wonRef.current) {
        switchTrack("gym");
      }
    };
  }, [switchTrack]);

  if (!department || !battleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>バトルデータが見つかりません</CardTitle>
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

  const currentQuestion = questionQueue[queueIndex];

  const handleStartBattle = () => {
    const track = (battleData.battleBgm || "battle") as import("../context/BgmContext").BgmTrack;
    switchTrack(track);
    setBattleState("question");
  };

  const advanceToNextQuestion = (enemyHpAfter: number, playerHpAfter: number) => {
    if (enemyHpAfter <= 0) {
      switchTrack("victory");
      setBattleState("victory");
      return;
    }
    if (playerHpAfter <= 0) {
      switchTrack("trainer");
      setBattleState("defeat");
      return;
    }
    if (queueIndex < questionQueue.length - 1) {
      setQueueIndex(queueIndex + 1);
      setSelectedOption(null);
      setCheckedOptions(new Set());
      setCheckboxSubmitted(false);
      setBattleState("question");
    } else {
      // 問題が尽きた場合: 正解数の方が多ければ勝利、そうでなければ敗北
      if (correctCount > wrongCount) {
        switchTrack("victory");
        setBattleState("victory");
      } else {
        switchTrack("trainer");
        setBattleState("defeat");
      }
    }
  };


  const processCorrectAnswer = (newEnemyHp: number) => {
    setTimeout(() => {
      setShowDamage(null);
      if (currentQuestion.explanation) {
        setBattleState("explanation");
      } else {
        advanceAfterCorrect(newEnemyHp);
      }
    }, 2000);
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);

    const isCorrect = index === currentQuestion.correctIndex;

    if (isCorrect) {
      setBattleState("correct");
      fireCorrectEffect();
      setShowDamage("enemy");
      const newEnemyHp = Math.max(0, enemyHp - battleData.damageToEnemy);
      setEnemyHp(newEnemyHp);
      setCorrectCount(c => c + 1);
      setTimeout(() => {
        setShowDamage(null);
        if (currentQuestion.explanation) {
          setBattleState("explanation");
        } else {
          advanceToNextQuestion(newEnemyHp, playerHp);
        }
      }, 2000);
    } else {
      setBattleState("incorrect");
      setShowDamage("player");
      const newPlayerHp = Math.max(0, playerHp - battleData.damageToPlayer);
      setPlayerHp(newPlayerHp);
      setWrongCount(w => w + 1);
      setTimeout(() => {
        setShowDamage(null);
        // 不正解でも解説があれば表示して次の問題へ（同じ問題は繰り返さない）
        if (currentQuestion.explanation) {
          setBattleState("explanation");
        } else {
          advanceToNextQuestion(enemyHp, newPlayerHp);
        }
      }, 2000);
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
      const newEnemyHp = Math.max(0, enemyHp - battleData.damageToEnemy);
      setEnemyHp(newEnemyHp);
      setCorrectCount(c => c + 1);
      setTimeout(() => {
        setShowDamage(null);
        if (currentQuestion.explanation) {
          setBattleState("explanation");
        } else {
          advanceToNextQuestion(newEnemyHp, playerHp);
        }
      }, 2000);
    } else {
      setBattleState("incorrect");
      setShowDamage("player");
      const newPlayerHp = Math.max(0, playerHp - battleData.damageToPlayer);
      setPlayerHp(newPlayerHp);
      setWrongCount(w => w + 1);
      setTimeout(() => {
        setShowDamage(null);
        if (currentQuestion.explanation) {
          setBattleState("explanation");
        } else {
          advanceToNextQuestion(enemyHp, newPlayerHp);
        }
      }, 2000);
    }
  };

  const handleRetry = () => {
    switchTrack("trainer");
    setPlayerHp(battleData.playerMaxHp);
    setEnemyHp(battleData.enemyMaxHp);
    const ordered = battleData.randomOrder
      ? shuffleArray(battleData.questions)
      : [...battleData.questions];
    setQuestionQueue(ordered.map(shuffleQuestionOptions));
    setQueueIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setSelectedOption(null);
    setCheckedOptions(new Set());
    setCheckboxSubmitted(false);
    setBattleState("intro");
  };

  const handleVictory = () => {
    wonRef.current = true;
    // アイテム報酬を付与
    if (battleData.rewardItem) addItem(battleData.rewardItem);
    if (battleData.rewardItems) battleData.rewardItems.forEach(item => addItem(item));
    // 農学部: 満腹度回復
    if (departmentId && battleData.recoversFullness && isCropDepartment(departmentId)) {
      const crop = getCropState(departmentId);
      if (crop.seeded) digestCrop(departmentId);
    }
    const nextStageId = battleData.nextStageId ?? battleData.afterStageId + 1;
    const hasNextStage = department.stages.some(s => s.id === nextStageId);
    if (hasNextStage) {
      navigate(`/department/${departmentId}/stage/${nextStageId}`);
    } else {
      // 次のステージがない場合は最終試練へ
      navigate(`/department/${departmentId}/battle`);
    }
  };

  const playerHpPercentage = (playerHp / battleData.playerMaxHp) * 100;
  const enemyHpPercentage = (enemyHp / battleData.enemyMaxHp) * 100;

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

  // イントロ画面
  if (battleState === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-red-500 rounded-full p-6 shadow-2xl animate-pulse">
                <Swords className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-red-900">
              中間試練！
            </h1>
            <p className="text-xl text-gray-700">
              {battleData.enemyName}が立ちはだかる！
            </p>
          </div>

          <Card className="shadow-2xl border-2 border-red-300">
            <CardHeader className="bg-gradient-to-r from-red-100 to-orange-100">
              <div className="flex items-center justify-center mb-4">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-red-400 shadow-lg">
                  <img
                    src={battleData.enemyImage}
                    alt={battleData.enemyName}
                    className="w-full h-full object-contain scale-[1.6]" style={{ transform: `scale(1.6) translateY(${battleData.enemyImageOffsetY || "0%"})` }}
                  />
                </div>
              </div>
              <CardTitle className="text-3xl text-center text-red-900">
                {battleData.enemyName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-300">
                <h3 className="font-bold text-lg text-amber-900 mb-3">⚔️ バトルルール</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• クイズに正解すると敵に<strong className="text-red-600">{battleData.damageToEnemy}ダメージ</strong></li>
                  <li>• クイズに不正解だとあなたが<strong className="text-blue-600">{battleData.damageToPlayer}ダメージ</strong>を受ける</li>
                  <li>• 敵のHPを0にすれば勝利！</li>
                  <li>• あなたのHPが0になると敗北...</li>
                </ul>
              </div>

              <div className="flex items-center justify-around p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-6 h-6 text-blue-600" />
                    <span className="font-bold text-blue-900">あなた</span>
                  </div>
                  <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                    HP: {battleData.playerMaxHp}
                  </Badge>
                </div>
                <Swords className="w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Skull className="w-6 h-6 text-red-600" />
                    <span className="font-bold text-red-900">敵</span>
                  </div>
                  <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                    HP: {battleData.enemyMaxHp}
                  </Badge>
                </div>
              </div>

              <Button
                onClick={handleStartBattle}
                className="w-full h-14 text-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <Swords className="w-6 h-6 mr-2" />
                バトル開始！
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 勝利画面
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
              勝利！
            </h1>
          </div>

          <Card className="shadow-2xl border-4 border-yellow-400">
            <CardContent className="space-y-6 pt-8">
              <div className="text-center space-y-3">
                <p className="text-2xl font-bold text-gray-800">
                  {battleData.enemyName}を倒した！
                </p>
                <p className="text-lg text-gray-600">
                  次の謎に進もう！
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-300">
                <p className="text-center text-lg text-gray-800 leading-relaxed">
                  見事な知識と判断力で<br />
                  中間試練を突破しました！
                </p>
              </div>

              {/* アイテム報酬 */}
              {(battleData.rewardItem || battleData.rewardItems) && (
                <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-300 space-y-2">
                  <h3 className="text-center font-bold text-purple-900 mb-3">🎁 アイテム入手！</h3>
                  {battleData.rewardItem && (
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-purple-200">
                      <span className="text-3xl">{battleData.rewardItem.icon}</span>
                      <div>
                        <p className="font-bold text-gray-900">{battleData.rewardItem.name}</p>
                        {battleData.rewardItem.description && <p className="text-xs text-gray-600">{battleData.rewardItem.description}</p>}
                      </div>
                    </div>
                  )}
                  {battleData.rewardItems?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-purple-200">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {battleData.nextLocationHint && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-10 rounded-2xl border-4 border-blue-300 shadow-xl">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="bg-blue-500 rounded-full p-5 shadow-lg">
                      <MapPin className="w-12 h-12 text-white" />
                    </div>
                    <h4 className="font-bold text-blue-900 text-3xl md:text-4xl">
                      次の目的地
                    </h4>
                    <p className="text-gray-800 text-xl md:text-2xl font-semibold leading-relaxed whitespace-pre-line">
                      {battleData.nextLocationHint}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleVictory}
                className="w-full h-14 text-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                次の謎へ
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 敗北画面
  if (battleState === "defeat") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-100 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gray-500 rounded-full p-8 shadow-2xl">
                <Skull className="w-20 h-20 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-700">
              敗北...
            </h1>
          </div>

          <Card className="shadow-2xl border-2 border-gray-400">
            <CardContent className="space-y-6 pt-8">
              <div className="text-center space-y-3">
                <p className="text-2xl font-bold text-gray-800">
                  {battleData.enemyName}に敗れた...
                </p>
                <p className="text-lg text-gray-600">
                  もう一度挑戦してみよう！
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full h-14 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <RotateCcw className="w-6 h-6 mr-2" />
                  再戦する
                </Button>

                <Button
                  onClick={() => navigate("/select")}
                  variant="outline"
                  className="w-full h-12 text-lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  学部選択に戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // バトル画面
  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* バトルステータス */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className={`${showDamage === "player" ? "animate-shake border-4 border-red-500" : ""}`}>
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-lg">あなた</CardTitle>
                </div>
                <Badge className="bg-blue-600 text-white">
                  {playerHp} / {battleData.playerMaxHp}
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
                  <CardTitle className="text-lg">{battleData.enemyName}</CardTitle>
                </div>
                <Badge className="bg-red-600 text-white">
                  {enemyHp} / {battleData.enemyMaxHp}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Progress value={enemyHpPercentage} className="h-6" />
            </CardContent>
          </Card>
        </div>

        {/* 敵の画像 */}
        <div className="flex justify-center">
          <div className={`w-48 h-48 rounded-full overflow-hidden border-4 border-red-400 shadow-xl ${
            showDamage === "enemy" ? "animate-shake" : ""
          }`}>
            <img
              src={battleData.enemyImage}
              alt={battleData.enemyName}
              className="w-full h-full object-contain scale-[1.6]" style={{ transform: `scale(1.6) translateY(${battleData.enemyImageOffsetY || "0%"})` }}
            />
          </div>
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
              {currentQuestion.explanationImage && (
                <div className="flex justify-center">
                  <img
                    src={currentQuestion.explanationImage}
                    alt="解説画像"
                    className="max-w-[280px] w-full rounded-xl shadow-md"
                  />
                </div>
              )}
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
            <CardHeader className={`bg-gradient-to-r ${colorClasses.from} ${colorClasses.to}`}>
              <CardTitle className="text-2xl text-center">
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

                    let buttonClass = "h-auto py-4 text-lg justify-start text-left";
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

                    let buttonClass = "h-auto py-4 text-lg justify-start text-left";
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
                    正解！ 敵に{battleData.damageToEnemy}ダメージ！
                  </AlertDescription>
                </Alert>
              )}

              {battleState === "incorrect" && (
                <Alert className="bg-red-50 border-red-300">
                  <Skull className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-800 font-bold text-lg">
                    不正解... {battleData.damageToPlayer}ダメージを受けた！
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
