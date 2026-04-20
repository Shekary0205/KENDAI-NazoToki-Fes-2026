import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowDown, Flame, Zap, Trophy } from "lucide-react";
import { markDepartmentAsCleared } from "../data/departments-data";
import { useBgm } from "../context/BgmContext";
import { fireCorrectEffect } from "../utils/confetti";

interface EscapeRiddle {
  question: string;
  options: string[];
  correctIndex: number;
}

/** 逃避パート用のダミー問題 */
const ESCAPE_RIDDLES: EscapeRiddle[] = [
  {
    question: "群馬県の農業生産額1位の作物は？",
    options: ["こんにゃく芋", "りんご", "ぶどう", "みかん"],
    correctIndex: 0,
  },
  {
    question: "植物の3大栄養素のうち、葉の成長に使われるのは？",
    options: ["窒素(N)", "リン酸(P)", "カリウム(K)", "カルシウム"],
    correctIndex: 0,
  },
  {
    question: "光合成で放出される気体は？",
    options: ["酸素", "二酸化炭素", "窒素", "水素"],
    correctIndex: 0,
  },
  {
    question: "米を作るときに田んぼに水を張る作業は？",
    options: ["田植え", "稲刈り", "脱穀", "籾摺り"],
    correctIndex: 0,
  },
  {
    question: "土の酸性度を示す指標は？",
    options: ["pH", "°C", "mL", "kg"],
    correctIndex: 0,
  },
];

type EscapeState = "intro" | "running" | "incorrect" | "descending" | "cleared";

export default function AgriEscape() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const { switchTrack } = useBgm();

  const [state, setState] = useState<EscapeState>("intro");
  const [currentFloor, setCurrentFloor] = useState(6);
  const [riddleIndex, setRiddleIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [bossScale, setBossScale] = useState(1);

  useEffect(() => {
    switchTrack("finalBattle");
    return () => { switchTrack("field"); };
  }, [switchTrack]);

  // ラスボス画像をパルスさせる（迫ってくる感）
  useEffect(() => {
    if (state !== "running") return;
    const interval = setInterval(() => {
      setBossScale(s => (s === 1 ? 1.08 : 1));
    }, 900);
    return () => clearInterval(interval);
  }, [state]);

  const currentRiddle = ESCAPE_RIDDLES[riddleIndex];

  const handleStart = () => {
    setState("running");
  };

  const handleAnswer = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const isCorrect = index === currentRiddle.correctIndex;
    if (isCorrect) {
      fireCorrectEffect();
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setState("descending");
      }, 500);
    } else {
      // 不正解でラスボスが接近
      setBossScale(1.2);
      setShake(true);
      setState("incorrect");
      setTimeout(() => {
        setShake(false);
        setBossScale(1);
        setSelectedOption(null);
        setState("running");
      }, 1500);
    }
  };

  const handleDescend = () => {
    const newFloor = currentFloor - 1;
    setCurrentFloor(newFloor);
    setSelectedOption(null);
    if (newFloor <= 1) {
      // 1階エントランスに到達 → クリア
      if (departmentId) markDepartmentAsCleared(departmentId);
      switchTrack("victory");
      setState("cleared");
    } else {
      // 次の問題へ
      setRiddleIndex(i => (i + 1) % ESCAPE_RIDDLES.length);
      setState("running");
    }
  };

  const handleGoToComplete = () => {
    navigate(`/department/${departmentId}/complete`);
  };

  // ===== クリア画面 =====
  if (state === "cleared") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-block bg-yellow-400 rounded-full p-8 shadow-2xl animate-bounce">
              <Trophy className="w-20 h-20 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600">
              逃げ切った！
            </h1>
          </div>
          <Card className="shadow-2xl border-4 border-yellow-400">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <p className="text-2xl font-bold text-gray-800">
                1階エントランスに到達！
              </p>
              <p className="text-lg text-gray-700">
                ラスボスは消滅した...
                <br />
                <strong className="text-yellow-700">農学部クリア！</strong>
              </p>
              <Button
                onClick={handleGoToComplete}
                className="w-full h-14 text-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                クリア画面へ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== イントロ =====
  if (state === "intro") {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center p-4">
        {/* 背景のラスボス画像 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <img
            src="/images/last.png"
            alt="ラスボス"
            className="w-full h-full object-cover animate-pulse"
            style={{ filter: "brightness(0.5) saturate(1.3)" }}
          />
        </div>
        {/* 稲妻的演出 */}
        <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none" />

        <div className="relative max-w-xl w-full space-y-6 z-10">
          <div className="text-center space-y-3">
            <div className="inline-block bg-red-600/90 px-6 py-2 rounded-full shadow-2xl animate-pulse">
              <span className="text-white font-bold text-sm tracking-widest">👹 緊急事態 👹</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(239,68,68,1)]">
              ラスボスが復活した！
            </h1>
            <p className="text-lg text-white font-semibold drop-shadow-md">
              倒したはずのキングフラワーが<br />
              怒りの姿で蘇った…！
            </p>
          </div>
          <Card className="shadow-2xl border-4 border-red-500 bg-white/95">
            <CardContent className="pt-6 pb-6 space-y-3 text-center">
              <p className="text-xl font-bold text-red-900">🏃 緊急脱出！</p>
              <p className="text-sm text-gray-800 leading-relaxed">
                このままでは捕まる！<br />
                問題に正解するごとに<strong className="text-red-600">一階ずつ下へ逃げる</strong>ことができる。
                <br /><br />
                <strong>6階 → 1階エントランス</strong> まで逃げ切れ！
              </p>
              <Button
                onClick={handleStart}
                className="w-full h-12 text-lg bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700"
              >
                <Flame className="w-5 h-5 mr-2" />
                逃げ出す！
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== 逃避中（running / incorrect） =====
  const bossOpacity = state === "incorrect" ? 0.9 : 0.55;
  const floorPct = ((7 - currentFloor) / 6) * 100;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-red-900 via-purple-900 to-slate-900">
      {/* 迫りくるラスボス画像（背景いっぱい） */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 ${shake ? "animate-shake" : ""}`}
        style={{
          opacity: bossOpacity,
          transform: `scale(${bossScale})`,
        }}
      >
        <img
          src="/images/last.png"
          alt="ラスボス"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.75) saturate(1.4) contrast(1.1)" }}
        />
      </div>
      {/* 赤いヴィニェット */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)" }} />

      {/* コンテンツ */}
      <div className="relative z-10 min-h-screen flex flex-col p-4">
        {/* フロア表示 */}
        <div className="text-center space-y-2 mb-4">
          <div className="inline-block bg-black/70 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg">
            <p className="text-red-300 text-xs font-semibold tracking-widest">CURRENT FLOOR</p>
            <p className="text-white text-4xl font-black drop-shadow-lg">{currentFloor}F</p>
          </div>
          {/* 進捗バー: 6F→1F */}
          <div className="max-w-md mx-auto bg-black/50 rounded-full h-3 overflow-hidden border border-red-500">
            <div
              className="h-3 bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 transition-all duration-500"
              style={{ width: `${floorPct}%` }}
            />
          </div>
          <p className="text-xs text-red-200 font-semibold">
            {currentFloor === 1 ? "🎉 エントランス到達間近！" : `あと ${currentFloor - 1} フロアで脱出！`}
          </p>
        </div>

        {/* 下降メッセージ画面（正解後） */}
        {state === "descending" ? (
          <div className="mt-auto max-w-xl w-full mx-auto">
            <Card className="shadow-2xl border-4 border-green-400 bg-white/95">
              <CardContent className="pt-6 pb-6 space-y-4 text-center">
                <div className="inline-block bg-green-500 rounded-full p-4 shadow-xl animate-bounce">
                  <ArrowDown className="w-10 h-10 text-white" />
                </div>
                <p className="text-2xl font-bold text-green-900">
                  ✨ 正解！
                </p>
                <p className="text-3xl font-black text-red-700 drop-shadow">
                  {currentFloor - 1}階まで降りろ！
                </p>
                <p className="text-sm text-gray-700">
                  {currentFloor - 1 <= 1
                    ? "もう少しでエントランス！"
                    : `残り ${currentFloor - 2} フロア`}
                </p>
                <Button
                  onClick={handleDescend}
                  className="w-full h-12 text-lg bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700"
                >
                  <ArrowDown className="w-5 h-5 mr-2" />
                  {currentFloor - 1 <= 1 ? "エントランスへ！" : "下のフロアへ！"}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
        <>
        {/* クイズカード（画面下部） */}
        <div className="mt-auto max-w-xl w-full mx-auto">
          <Card className="shadow-2xl border-4 border-red-400 bg-white/95">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-600 animate-pulse" />
                <CardTitle className="text-lg">正解して下のフロアへ逃げろ！</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <p className="text-lg font-bold text-gray-900 whitespace-pre-line">
                {currentRiddle.question}
              </p>
              <div className="grid gap-2">
                {currentRiddle.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrect = index === currentRiddle.correctIndex;
                  const showResult = selectedOption !== null;
                  let cls = "h-auto py-3 text-base justify-start text-left whitespace-normal";
                  if (showResult) {
                    if (isSelected && isCorrect) cls += " bg-green-500 hover:bg-green-500 text-white border-green-600";
                    else if (isSelected && !isCorrect) cls += " bg-red-500 hover:bg-red-500 text-white border-red-600";
                    else if (isCorrect) cls += " bg-green-100 border-green-400";
                  }
                  return (
                    <Button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedOption !== null}
                      variant="outline"
                      className={cls}
                    >
                      <span className="mr-2 font-bold">{String.fromCharCode(65 + index)}.</span>{option}
                    </Button>
                  );
                })}
              </div>
              {state === "incorrect" && (
                <div className="bg-red-100 border-2 border-red-400 rounded-lg p-2 text-center">
                  <p className="text-red-900 font-bold">不正解！ラスボスが迫る…！</p>
                </div>
              )}
              {state === "running" && selectedOption !== null && selectedOption === currentRiddle.correctIndex && (
                <div className="bg-green-100 border-2 border-green-400 rounded-lg p-2 text-center">
                  <p className="text-green-900 font-bold flex items-center justify-center gap-1">
                    <ArrowDown className="w-4 h-4" />正解！下のフロアへ！
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: scale(${bossScale}) translateX(0); }
          20% { transform: scale(${bossScale}) translateX(-15px); }
          40% { transform: scale(${bossScale}) translateX(15px); }
          60% { transform: scale(${bossScale}) translateX(-10px); }
          80% { transform: scale(${bossScale}) translateX(10px); }
        }
        .animate-shake { animation: shake 0.5s; }
      `}</style>
    </div>
  );
}
