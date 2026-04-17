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
import {
  getCardsForCrop,
  getPassiveForCrop,
  getAttackEmojis,
  MAX_ENERGY,
  ENERGY_PER_CORRECT,
  type SkillCard,
} from "../data/cropSkills";
import {
  getDialogueForCrop,
  getCropHand,
  judgeJanken,
  HAND_INFO,
  type Hand,
  type JankenResult,
} from "../data/cropMiniGames";
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
  const playerName = cropState.nickname ?? playerEvoName ?? playerVisual.label;
  const playerSpecies = playerEvoName; // 種族名（進化名）は別表示
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
  // ===== スキル/パッシブ関連ステート =====
  const cards = getCardsForCrop(cropState);
  const passive = getPassiveForCrop(cropState);
  const [energy, setEnergy] = useState(0);
  const [attackBuff, setAttackBuff] = useState(1); // 次の正解ダメージ倍率
  const [shieldMult, setShieldMult] = useState(1); // 次の被ダメージ倍率
  const [optionReduce, setOptionReduce] = useState(0); // 次の問題で選択肢を削減する数
  const [autoAnswer, setAutoAnswer] = useState(false); // 次の問題を自動成功
  const [skillToast, setSkillToast] = useState<string | null>(null);
  const [chainBonus, setChainBonus] = useState(0); // 連撃のパッシブ（累積倍率）
  const [usedReviveFlag, setUsedRevive] = useState(false); // 天使フラワーの復活を使用済みか
  const [usedFirstHit, setUsedFirstHit] = useState(false); // イケメンの先制が消費済みか
  const [hiddenOptions, setHiddenOptions] = useState<Set<number>>(new Set());
  const [particleBurstKey, setParticleBurstKey] = useState(0); // インクリしてエフェクト再生
  const attackEmojis = getAttackEmojis(cropState);
  // ミニゲーム用ステート
  const [miniGame, setMiniGame] = useState<"none" | "conversation" | "janken">("none");
  const [dialogueChoiceIndex, setDialogueChoiceIndex] = useState<number | null>(null);
  const [jankenRound, setJankenRound] = useState(0);
  const [jankenPlayerHand, setJankenPlayerHand] = useState<Hand | null>(null);
  const [jankenCropHand, setJankenCropHand] = useState<Hand | null>(null);
  const [jankenWins, setJankenWins] = useState(0);
  const [jankenLosses, setJankenLosses] = useState(0);
  const [jankenLast, setJankenLast] = useState<JankenResult | null>(null);
  const dialogueSet = getDialogueForCrop(cropState);
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

  // 選択肢を減らす処理
  useEffect(() => {
    if (!currentQuestion || optionReduce <= 0) {
      setHiddenOptions(new Set());
      return;
    }
    const wrongIndices = currentQuestion.options
      .map((_, i) => i)
      .filter(i => i !== currentQuestion.correctIndex);
    const shuffled = [...wrongIndices].sort(() => Math.random() - 0.5);
    const toHide = shuffled.slice(0, Math.min(optionReduce, wrongIndices.length - 1));
    setHiddenOptions(new Set(toHide));
  }, [optionReduce, queueIndex, currentQuestion]);

  // 敵にダメージが入った瞬間にパーティクルバーストをトリガー
  useEffect(() => {
    if (showDamage === "enemy") {
      setParticleBurstKey(k => k + 1);
    }
  }, [showDamage]);

  const handleStartBattle = () => {
    const track = (battleData.battleBgm || "battle") as import("../context/BgmContext").BgmTrack;
    switchTrack(track);
    // パッシブ: 賢者の先見の明（開始時Energy+2）
    let startEnergy = 0;
    if (passive.id === "startEnergy") startEnergy = 2;
    setEnergy(startEnergy);
    setAttackBuff(1);
    setShieldMult(1);
    setOptionReduce(passive.id === "clairvoyance" ? 1 : 0);
    setAutoAnswer(false);
    setChainBonus(0);
    setUsedRevive(false);
    setUsedFirstHit(false);
    setBattleState("question");
  };

  // トースト表示
  const showToast = (msg: string) => {
    setSkillToast(msg);
    setTimeout(() => setSkillToast(null), 2000);
  };

  // カード使用
  const handlePlayCard = (card: SkillCard) => {
    if (energy < card.energyCost) return;
    if (battleState !== "question") return;
    setEnergy(e => e - card.energyCost);
    const eff = card.effect;
    switch (eff.type) {
      case "damage": {
        const dmg = eff.amount;
        setShowDamage("enemy");
        const newE = Math.max(0, enemyHp - dmg);
        setEnemyHp(newE);
        showToast(`${card.icon} ${card.name}！ ${dmg}ダメージ！`);
        setTimeout(() => {
          setShowDamage(null);
          if (newE <= 0) { switchTrack("victory"); setBattleState("victory"); }
        }, 1000);
        break;
      }
      case "heal": {
        const amt = eff.amount >= 999 ? battleData.playerMaxHp : eff.amount;
        setPlayerHp(p => Math.min(battleData.playerMaxHp, p + amt));
        showToast(`${card.icon} ${card.name}！ HP回復！`);
        break;
      }
      case "attackBuff": {
        setAttackBuff(eff.multiplier);
        showToast(`${card.icon} ${card.name}！ 次の攻撃${eff.multiplier}倍！`);
        break;
      }
      case "shield": {
        setShieldMult(eff.multiplier);
        showToast(`${card.icon} ${card.name}！ 次の被ダメ${Math.round((1 - eff.multiplier) * 100)}%カット！`);
        break;
      }
      case "reduceOptions": {
        setOptionReduce(prev => prev + eff.count);
        showToast(`${card.icon} ${card.name}！ 選択肢-${eff.count}！`);
        break;
      }
      case "skipQuestion": {
        const dmg = eff.damage;
        setShowDamage("enemy");
        const newE = Math.max(0, enemyHp - dmg);
        setEnemyHp(newE);
        showToast(`${card.icon} ${card.name}！ ${dmg}ダメージ！`);
        setTimeout(() => {
          setShowDamage(null);
          if (newE <= 0) { switchTrack("victory"); setBattleState("victory"); return; }
          // 次の問題へ
          advanceToNextQuestion(newE, playerHp);
        }, 1000);
        break;
      }
      case "gainEnergy": {
        setEnergy(e => Math.min(MAX_ENERGY, e + eff.amount));
        showToast(`${card.icon} ${card.name}！ エネルギー+${eff.amount}`);
        break;
      }
      case "combo": {
        const dmg = eff.damage;
        setShowDamage("enemy");
        const newE = Math.max(0, enemyHp - dmg);
        setEnemyHp(newE);
        setEnergy(e => Math.min(MAX_ENERGY, e + eff.energy));
        showToast(`${card.icon} ${card.name}！ ${dmg}ダメージ+エネ+${eff.energy}`);
        setTimeout(() => {
          setShowDamage(null);
          if (newE <= 0) { switchTrack("victory"); setBattleState("victory"); }
        }, 1000);
        break;
      }
    }
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

  // 正解時のダメージ計算（パッシブ・バフ適用）
  const calcDamageToEnemy = () => {
    let multiplier = attackBuff;
    // パッシブ: chainAttack（強さ） - 累積20%ずつ
    if (passive.id === "chainAttack") multiplier *= 1 + chainBonus;
    // パッシブ: firstHit（イケメン） - 初撃のみ2倍+必中
    if (passive.id === "firstHit" && !usedFirstHit) multiplier *= 2;
    // パッシブ: lowHpBoost（最強） - HP50%以下で+100%
    if (passive.id === "lowHpBoost" && playerHp / battleData.playerMaxHp < 0.5) multiplier *= 2;
    return Math.round(battleData.damageToEnemy * multiplier);
  };

  // 被ダメージ計算（シールド・パッシブ適用）
  const calcDamageToPlayer = () => {
    let mult = shieldMult;
    // パッシブ: evadeWrong（賢さ） - 50%で回避
    if (passive.id === "evadeWrong" && Math.random() < 0.5) {
      showToast("🌀 博識回避！ダメージ無効");
      return 0;
    }
    // パッシブ: wrongReduce（紳士） - 半減
    if (passive.id === "wrongReduce") mult *= 0.5;
    return Math.round(battleData.damageToPlayer * mult);
  };

  // 正解後の共通処理
  const onCorrectAnswer = () => {
    const dmg = calcDamageToEnemy();
    const newEHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(newEHp);
    // バフ消費
    setAttackBuff(1);
    // パッシブ: firstHit消費
    if (passive.id === "firstHit") setUsedFirstHit(true);
    // パッシブ: chainAttack（累積）
    if (passive.id === "chainAttack") setChainBonus(b => b + 0.2);
    // エネルギー獲得
    setEnergy(e => Math.min(MAX_ENERGY, e + ENERGY_PER_CORRECT));
    return newEHp;
  };

  // 不正解時の共通処理
  const onWrongAnswer = () => {
    const dmg = calcDamageToPlayer();
    const newPHp = Math.max(0, playerHp - dmg);
    setPlayerHp(newPHp);
    // シールド消費
    setShieldMult(1);
    // パッシブ: chainAttack 累積リセット
    if (passive.id === "chainAttack") setChainBonus(0);
    // パッシブ: autoHeal（優しさ）
    if (passive.id === "autoHeal" && newPHp > 0 && newPHp / battleData.playerMaxHp < 0.3) {
      const healed = Math.min(battleData.playerMaxHp, newPHp + 10);
      setPlayerHp(healed);
      setTimeout(() => showToast("🌱 自然治癒！HP+10"), 1200);
    }
    return newPHp;
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    // autoAnswer中なら強制正解
    const isCorrect = autoAnswer ? true : index === currentQuestion.correctIndex;
    if (autoAnswer) setAutoAnswer(false);
    if (isCorrect) {
      setBattleState("correct"); fireCorrectEffect(); setShowDamage("enemy");
      const newEHp = onCorrectAnswer();
      setTimeout(() => {
        setShowDamage(null);
        setOptionReduce(passive.id === "clairvoyance" ? 1 : 0);
        if (newEHp <= 0) { switchTrack("victory"); setBattleState("victory"); return; }
        currentQuestion.explanation ? setBattleState("explanation") : advanceToNextQuestion(newEHp, playerHp);
      }, 1800);
    } else {
      setBattleState("incorrect"); setShowDamage("player");
      const newPHp = onWrongAnswer();
      setTimeout(() => {
        setShowDamage(null);
        setOptionReduce(passive.id === "clairvoyance" ? 1 : 0);
        if (newPHp <= 0) {
          // パッシブ: revive（天使）
          if (passive.id === "revive" && !usedReviveFlag) {
            const revivedHp = Math.floor(battleData.playerMaxHp * 0.5);
            setPlayerHp(revivedHp);
            setUsedRevive(true);
            showToast("✨ 天使の祝福！復活！");
            currentQuestion.explanation ? setBattleState("explanation") : advanceToNextQuestion(enemyHp, revivedHp);
            return;
          }
        }
        currentQuestion.explanation ? setBattleState("explanation") : advanceToNextQuestion(enemyHp, newPHp);
      }, 1800);
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
      const newEHp = onCorrectAnswer();
      setTimeout(() => {
        setShowDamage(null);
        setOptionReduce(passive.id === "clairvoyance" ? 1 : 0);
        if (newEHp <= 0) { switchTrack("victory"); setBattleState("victory"); return; }
        currentQuestion.explanation ? setBattleState("explanation") : advanceToNextQuestion(newEHp, playerHp);
      }, 1800);
    } else {
      setBattleState("incorrect"); setShowDamage("player");
      const newPHp = onWrongAnswer();
      setTimeout(() => {
        setShowDamage(null);
        setOptionReduce(passive.id === "clairvoyance" ? 1 : 0);
        currentQuestion.explanation ? setBattleState("explanation") : advanceToNextQuestion(enemyHp, newPHp);
      }, 1800);
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
  const isFinalBattle = battleData.afterStageId >= department.stages.length;

  // ===== バトルフィールド（共通） =====
  const bgClass = isFinalBattle
    ? "relative bg-gradient-to-b from-red-950 via-purple-950 to-black rounded-2xl overflow-hidden h-72 shadow-inner animate-bossGlow"
    : "relative bg-gradient-to-b from-sky-200 via-green-200 to-green-400 rounded-2xl overflow-hidden h-72 shadow-inner";

  const BattleField = () => (
    <div className={bgClass}>
      {/* 地面ライン */}
      {isFinalBattle ? (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-red-900/60 to-transparent" />
          {/* 溶岩/火花エフェクト */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-orange-400 opacity-70 animate-ember"
                style={{
                  left: `${10 + i * 11}%`,
                  bottom: `${Math.random() * 40}%`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
          {/* 稲妻（時々光る） */}
          <div className="absolute inset-0 bg-red-500/10 animate-lightning pointer-events-none" />
          {/* ボスラベル */}
          <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
            👑 最終決戦
          </div>
        </>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-600/40 to-transparent" />
      )}

      {/* 敵作物（右上） */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
        <div className={`backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md min-w-[140px] ${isFinalBattle ? "bg-red-950/80 border border-red-500" : "bg-white/85"}`}>
          <p className={`font-bold text-sm text-right ${isFinalBattle ? "text-red-200" : "text-red-900"}`}>{enemyName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] ${isFinalBattle ? "text-red-300" : "text-gray-600"}`}>HP</span>
            <div className="flex-1 bg-gray-300 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full transition-all duration-500 ${enemyHpPct > 50 ? "bg-green-500" : enemyHpPct > 20 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${enemyHpPct}%` }} />
            </div>
          </div>
          <p className={`text-[10px] text-right mt-0.5 ${isFinalBattle ? "text-red-300" : "text-gray-500"}`}>{enemyHp}/{battleData.enemyMaxHp}</p>
        </div>
        <div className={`relative w-28 h-28 rounded-full overflow-hidden bg-white ${showDamage === "enemy" ? "animate-shake" : ""} ${isFinalBattle ? "shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-bossPulse border-4 border-red-600" : "shadow-xl border-2 border-white"}`}>
          <img src={enemyImage} alt={enemyName} className="w-full h-full object-cover object-center scale-150"
            style={isFinalBattle ? { filter: "brightness(0.9) saturate(1.4) contrast(1.15) drop-shadow(0 0 8px rgba(239,68,68,0.9))" } : undefined} />
          {/* 攻撃パーティクルエフェクト */}
          {showDamage === "enemy" && (
            <div key={particleBurstKey} className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const dist = 70 + Math.random() * 30;
                const dx = Math.cos(angle) * dist;
                const dy = Math.sin(angle) * dist;
                const emoji = attackEmojis[i % attackEmojis.length];
                return (
                  <span
                    key={i}
                    className="absolute left-1/2 top-1/2 text-3xl animate-particleBurst"
                    style={{
                      // @ts-expect-error CSS vars
                      "--dx": `${dx}px`,
                      "--dy": `${dy}px`,
                      animationDelay: `${i * 30}ms`,
                    }}
                  >
                    {emoji}
                  </span>
                );
              })}
            </div>
          )}
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
        <div className={`backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md min-w-[160px] ${isFinalBattle ? "bg-white/95 border border-green-400" : "bg-white/85"}`}>
          <div className="flex items-baseline justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-green-900 truncate">{playerName}</p>
              {playerSpecies && <p className="text-[9px] text-purple-700 font-semibold truncate">{playerSpecies}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-600">HP</span>
            <div className="flex-1 bg-gray-300 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full transition-all duration-500 ${playerHpPct > 50 ? "bg-green-500" : playerHpPct > 20 ? "bg-yellow-500" : "bg-red-500"}`}
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
    const introBg = isFinalBattle
      ? "relative min-h-screen overflow-hidden bg-gradient-to-br from-red-700 via-purple-700 to-slate-800 flex items-center justify-center p-4"
      : "min-h-screen bg-gradient-to-br from-green-100 via-yellow-50 to-orange-100 flex items-center justify-center p-4";
    return (
      <div className={introBg}>
        {/* 最終戦闘: 背景エフェクト */}
        {isFinalBattle && (
          <>
            {/* 稲妻 */}
            <div className="absolute inset-0 bg-red-500/10 animate-lightning pointer-events-none" />
            {/* 火花 */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(14)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-orange-400 opacity-70 animate-ember"
                  style={{
                    left: `${5 + i * 7}%`,
                    bottom: `${Math.random() * 50}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>
            {/* 赤黒ヴィニェット（軽め） */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)" }} />
          </>
        )}

        <div className="relative max-w-2xl w-full space-y-6 z-10">
          <div className="text-center space-y-3">
            {isFinalBattle ? (
              <>
                <div className="inline-block bg-gradient-to-r from-red-600 via-purple-600 to-red-600 px-6 py-1.5 rounded-full shadow-lg animate-pulse">
                  <span className="text-white font-bold text-sm tracking-widest">👑 最終決戦 👑</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_0_18px_rgba(239,68,68,0.9)]">
                  ラスボス襲来！
                </h1>
                <p className="text-lg text-white font-semibold drop-shadow-md">
                  全てを育てあげた作物の力で、最後の敵を打ち破れ！
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-bold text-green-900">作物バトル！</h1>
                <p className="text-lg text-gray-700">きみの作物で敵を倒せ！</p>
              </>
            )}
          </div>

          {/* VS表示 */}
          <Card className={`shadow-2xl border-4 overflow-hidden ${isFinalBattle ? "border-red-500 bg-white" : "border-green-400"}`}>
            <div className={`flex items-center justify-around p-6 ${isFinalBattle ? "bg-gradient-to-r from-red-100 via-purple-100 to-red-100" : "bg-gradient-to-r from-green-50 to-red-50"}`}>
              {/* 自作物 */}
              <div className="text-center space-y-2">
                <div className={`w-28 h-28 mx-auto rounded-full border-4 shadow-lg flex items-center justify-center overflow-hidden bg-white ${isFinalBattle ? "border-green-500" : "border-green-400"}`}>
                  {playerVisual.image
                    ? <img src={playerVisual.image} alt={playerName} className="w-full h-full object-cover" />
                    : <span className="text-5xl">🌱</span>
                  }
                </div>
                <p className="font-bold text-sm text-green-900">{playerName}</p>
                {playerSpecies && (
                  <p className="text-[10px] font-semibold text-purple-700">{playerSpecies}</p>
                )}
                <div className="flex items-center justify-center gap-2 text-xs">
                  {(["kindness", "strength", "wisdom"] as CropStat[]).map(s => (
                    <span key={s} className={`font-semibold ${cropState[s] >= 3 ? CROP_STAT_INFO[s].color : "text-gray-400"}`}>
                      {CROP_STAT_INFO[s].icon}{cropState[s]}
                    </span>
                  ))}
                </div>
                <Badge className="bg-blue-600 text-white">HP: {battleData.playerMaxHp}</Badge>
              </div>

              <div className={`text-5xl font-black animate-pulse ${isFinalBattle ? "text-red-700 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]" : "text-red-600"}`}>VS</div>

              {/* 敵作物 */}
              <div className="text-center space-y-2">
                <div className={`w-28 h-28 mx-auto rounded-full border-4 overflow-hidden bg-white ${isFinalBattle ? "border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-bossPulse" : "border-red-400 shadow-lg"}`}>
                  <img src={enemyImage} alt={enemyName} className="w-full h-full object-cover object-center scale-150"
                    style={isFinalBattle ? { filter: "brightness(0.9) saturate(1.4) contrast(1.15) drop-shadow(0 0 8px rgba(239,68,68,0.9))" } : undefined} />
                </div>
                <p className="font-bold text-sm text-red-900">{enemyName}</p>
                <Badge className="bg-red-600 text-white">HP: {battleData.enemyMaxHp}</Badge>
              </div>
            </div>

            <CardContent className="space-y-4 pt-6">
              <div className={`p-4 rounded-lg border-2 ${isFinalBattle ? "bg-red-50 border-red-400" : "bg-amber-50 border-amber-300"}`}>
                <h3 className={`font-bold mb-2 ${isFinalBattle ? "text-red-900" : "text-amber-900"}`}>⚔️ バトルルール</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• 正解で敵に <strong className="text-red-600">{battleData.damageToEnemy}ダメージ</strong></li>
                  <li>• 不正解で <strong className="text-blue-600">{battleData.damageToPlayer}ダメージ</strong></li>
                  <li>• 敵のHPを0にすれば勝利！</li>
                </ul>
              </div>
              <Button
                onClick={handleStartBattle}
                className={`w-full h-14 text-xl ${isFinalBattle
                  ? "bg-gradient-to-r from-red-700 via-purple-700 to-red-700 hover:from-red-600 hover:via-purple-600 hover:to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                }`}
              >
                <Swords className="w-6 h-6 mr-2" />
                {isFinalBattle ? "最終決戦へ！" : "バトル開始！"}
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

              {/* ミニゲーム */}
              <div className="bg-pink-50 p-5 rounded-xl border-2 border-pink-300 space-y-3">
                <p className="font-bold text-pink-900">🎮 作物とふれあう</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => { setDialogueChoiceIndex(null); setMiniGame("conversation"); }}
                    className="h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    💬 会話する
                  </Button>
                  <Button
                    onClick={() => {
                      setJankenRound(0); setJankenWins(0); setJankenLosses(0);
                      setJankenPlayerHand(null); setJankenCropHand(null); setJankenLast(null);
                      setMiniGame("janken");
                    }}
                    className="h-14 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  >
                    ✌️ じゃんけん
                  </Button>
                </div>
              </div>

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

        {/* 会話モーダル */}
        {miniGame === "conversation" && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-2xl border-4 border-pink-400">
              <CardHeader className="bg-gradient-to-r from-pink-100 to-rose-100">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-pink-400 bg-white flex-shrink-0">
                    {playerVisual.image && <img src={playerVisual.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <CardTitle className="text-lg">{playerName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="bg-white p-4 rounded-xl border-2 border-pink-200 text-gray-800 text-base leading-relaxed">
                  {dialogueChoiceIndex === null
                    ? `「${dialogueSet.opening}」`
                    : `「${dialogueSet.choices[dialogueChoiceIndex].reply}」`}
                </div>
                {dialogueChoiceIndex === null ? (
                  <div className="space-y-2">
                    {dialogueSet.choices.map((c, i) => (
                      <Button
                        key={i}
                        onClick={() => setDialogueChoiceIndex(i)}
                        variant="outline"
                        className="w-full h-auto py-3 justify-start text-left border-pink-300 hover:bg-pink-50"
                      >
                        {c.text}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Button
                    onClick={() => setMiniGame("none")}
                    className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    閉じる
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* じゃんけんモーダル */}
        {miniGame === "janken" && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-2xl border-4 border-indigo-400">
              <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100">
                <CardTitle className="text-center">✌️ じゃんけん3本勝負</CardTitle>
                <p className="text-center text-sm text-gray-700">
                  ラウンド {Math.min(jankenRound + 1, 3)} / 3 ・ 勝ち {jankenWins} / 負け {jankenLosses}
                </p>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* 対面表示 */}
                <div className="flex items-center justify-around py-2">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-green-400 bg-white mx-auto mb-1">
                      {playerVisual.image && <img src={playerVisual.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <p className="text-xs font-semibold">{playerName}</p>
                    <div className="text-4xl mt-1 h-10">
                      {jankenPlayerHand ? HAND_INFO[jankenPlayerHand].icon : "？"}
                    </div>
                  </div>
                  <div className="text-2xl font-black text-purple-600">VS</div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-red-400 bg-white mx-auto mb-1">
                      <img src={enemyImage} alt={enemyName} className="w-full h-full object-cover scale-150" />
                    </div>
                    <p className="text-xs font-semibold">{enemyName}</p>
                    <div className="text-4xl mt-1 h-10">
                      {jankenCropHand ? HAND_INFO[jankenCropHand].icon : "？"}
                    </div>
                  </div>
                </div>

                {/* 結果表示 */}
                {jankenLast && (
                  <div className={`text-center font-bold text-xl p-2 rounded-lg ${
                    jankenLast === "win" ? "bg-green-100 text-green-800" :
                    jankenLast === "lose" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {jankenLast === "win" ? "🎉 あなたの勝ち！" : jankenLast === "lose" ? "😢 負け…" : "🤝 あいこ"}
                  </div>
                )}

                {jankenRound < 3 ? (
                  <>
                    <p className="text-center text-sm text-gray-600">手を選んで！</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(["rock", "scissors", "paper"] as Hand[]).map(h => (
                        <Button
                          key={h}
                          onClick={() => {
                            const crop = getCropHand(cropState);
                            const result = judgeJanken(h, crop);
                            setJankenPlayerHand(h);
                            setJankenCropHand(crop);
                            setJankenLast(result);
                            if (result === "win") setJankenWins(w => w + 1);
                            else if (result === "lose") setJankenLosses(l => l + 1);
                            setJankenRound(r => r + 1);
                          }}
                          variant="outline"
                          className="h-20 flex flex-col items-center gap-0.5 border-indigo-300 hover:bg-indigo-50"
                          disabled={!!jankenLast && jankenRound < 3 && jankenRound !== 0 ? false : !!jankenLast}
                        >
                          <span className="text-3xl">{HAND_INFO[h].icon}</span>
                          <span className="text-xs">{HAND_INFO[h].label}</span>
                        </Button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-3">
                    <p className="text-xl font-bold">
                      {jankenWins > jankenLosses ? "🏆 勝利！" : jankenWins < jankenLosses ? "💔 敗北…" : "🤝 引き分け"}
                    </p>
                    <p className="text-sm text-gray-700">
                      {jankenWins}勝 {jankenLosses}敗 {3 - jankenWins - jankenLosses}分
                    </p>
                  </div>
                )}

                <Button onClick={() => setMiniGame("none")} variant="outline" className="w-full h-12">
                  閉じる
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
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
        {BattleField()}

        {/* エネルギー & スキルカード */}
        {cards.length > 0 && (
          <Card className="shadow-md border-2 border-purple-300">
            <CardContent className="pt-3 pb-3 space-y-2">
              {/* エネルギーバー */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-800">⚡ エネルギー</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${(energy / MAX_ENERGY) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700">{energy}/{MAX_ENERGY}</span>
              </div>
              {/* パッシブ表示 */}
              {passive.id !== "none" && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">✨ {passive.name}</span>
                  <span className="text-gray-600">{passive.description}</span>
                </div>
              )}
              {/* カードボタン */}
              <div className="flex flex-wrap gap-2">
                {cards.map(card => {
                  const canPlay = energy >= card.energyCost && battleState === "question";
                  return (
                    <button
                      key={card.id}
                      onClick={() => handlePlayCard(card)}
                      disabled={!canPlay}
                      title={card.description}
                      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border-2 transition-all min-w-[78px]
                        ${canPlay
                          ? "border-purple-400 bg-white hover:bg-purple-50 hover:border-purple-600 active:scale-95 shadow-sm"
                          : "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                        }`}
                    >
                      <span className="text-xl">{card.icon}</span>
                      <span className="text-[11px] font-semibold text-gray-800 leading-tight text-center">{card.name}</span>
                      <span className={`text-[10px] font-bold ${canPlay ? "text-purple-700" : "text-gray-500"}`}>⚡{card.energyCost}</span>
                    </button>
                  );
                })}
              </div>
              {/* スキルトースト */}
              {skillToast && (
                <div className="text-center text-sm font-bold text-purple-900 bg-purple-100 border border-purple-300 rounded-lg py-1 animate-pulse">
                  {skillToast}
                </div>
              )}
              {/* 状態表示 */}
              {(attackBuff > 1 || shieldMult < 1 || optionReduce > 0 || chainBonus > 0) && (
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {attackBuff > 1 && (
                    <span className="bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded">攻撃×{attackBuff}</span>
                  )}
                  {shieldMult < 1 && (
                    <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">被ダメ×{shieldMult}</span>
                  )}
                  {optionReduce > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded">選択肢-{optionReduce}</span>
                  )}
                  {chainBonus > 0 && (
                    <span className="bg-orange-100 text-orange-800 font-semibold px-2 py-0.5 rounded">連撃+{Math.round(chainBonus * 100)}%</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                    if (hiddenOptions.has(index)) return null;
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

        @keyframes bossGlow {
          0%, 100% { box-shadow: inset 0 0 60px rgba(220, 38, 38, 0.5); }
          50%      { box-shadow: inset 0 0 100px rgba(168, 85, 247, 0.7); }
        }
        .animate-bossGlow { animation: bossGlow 3s ease-in-out infinite; }

        @keyframes bossPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(239, 68, 68, 0.8); }
          50%      { transform: scale(1.05); box-shadow: 0 0 55px rgba(168, 85, 247, 1); }
        }
        .animate-bossPulse { animation: bossPulse 2s ease-in-out infinite; }

        @keyframes ember {
          0%   { transform: translateY(0) scale(1); opacity: 0.9; }
          100% { transform: translateY(-180px) scale(0.3); opacity: 0; }
        }
        .animate-ember { animation: ember linear infinite; }

        @keyframes lightning {
          0%, 100%    { opacity: 0; }
          48%, 52%    { opacity: 0; }
          50%         { opacity: 0.6; }
          70%, 73%    { opacity: 0; }
          72%         { opacity: 0.4; }
        }
        .animate-lightning { animation: lightning 7s linear infinite; }

        @keyframes particleBurst {
          0%   { transform: translate(-50%, -50%) scale(0.2) rotate(0deg); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.5) rotate(360deg); opacity: 0; }
        }
        .animate-particleBurst { animation: particleBurst 1.2s ease-out forwards; }
      `}</style>
    </div>
  );
}
