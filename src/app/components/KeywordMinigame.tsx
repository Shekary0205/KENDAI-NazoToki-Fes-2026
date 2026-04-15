import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Home,
  Gamepad2,
  Trophy,
  Key,
  RotateCcw,
  HelpCircle,
  Shuffle,
  Puzzle,
  Music,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getDepartmentById,
  saveObtainedKeyword,
  clearKeywordStageProgress,
  normalizeAnswer,
} from "../data/departments-data";
import { useBgm } from "../context/BgmContext";
import { fireCorrectEffect } from "../utils/confetti";

// ===== ステージ1: 単語スクランブル =====
const SCRAMBLE_WORDS = [
  { word: "ほいくし", hint: "乳幼児の保育を行う国家資格" },
  { word: "きょういんめんきょ", hint: "教師として働くために必要な資格" },
  { word: "もんてっそーり", hint: "子どもの自発的活動を促す教育法" },
  { word: "ようちえんきょうゆ", hint: "3歳〜就学前の幼児の教育を行う専門職" },
  { word: "がっきゅうけいえい", hint: "担任が学級を運営・管理する営み" },
];

// ===== ステージ2: ペアマッチング =====
const PAIRS = [
  { id: 1, term: "SEL", description: "社会情動的学習（こころの教育）" },
  { id: 2, term: "ICT教育", description: "情報通信技術を活用した教育" },
  { id: 3, term: "認定絵本士", description: "絵本や読み聞かせを学ぶ資格" },
  { id: 4, term: "司書教諭", description: "学校図書館の運営を担う教員" },
  { id: 5, term: "食育", description: "食に関する知識と選択力を育む教育" },
  { id: 6, term: "読み聞かせ", description: "絵本を子どもに読んで聞かせる活動" },
];

type CardItem = {
  id: number;
  pairId: number;
  content: string;
  type: "term" | "description";
  flipped: boolean;
  matched: boolean;
};

// ===== ステージ3: ピアノ童謡 =====
const PIANO_KEYS = [
  { note: "ド", color: "bg-red-200 border-red-400", freq: 261.63 },
  { note: "レ", color: "bg-orange-200 border-orange-400", freq: 293.66 },
  { note: "ミ", color: "bg-yellow-200 border-yellow-400", freq: 329.63 },
  { note: "ファ", color: "bg-green-200 border-green-400", freq: 349.23 },
  { note: "ソ", color: "bg-blue-200 border-blue-400", freq: 392.00 },
  { note: "ラ", color: "bg-indigo-200 border-indigo-400", freq: 440.00 },
  { note: "シ", color: "bg-purple-200 border-purple-400", freq: 493.88 },
];

const PIANO_SONGS = [
  {
    name: "きらきらぼし",
    notes: ["ド", "ド", "ソ", "ソ", "ラ", "ラ", "ソ", "ファ", "ファ", "ミ", "ミ", "レ", "レ", "ド"],
  },
  {
    name: "ちょうちょう",
    notes: ["ソ", "ミ", "ミ", "ファ", "レ", "レ", "ド", "レ", "ミ", "ファ", "ソ", "ソ", "ソ"],
  },
  {
    name: "メリーさんのひつじ",
    notes: ["ミ", "レ", "ド", "レ", "ミ", "ミ", "ミ", "レ", "レ", "レ", "ミ", "ソ", "ソ"],
  },
];

type MiniStage = "intro" | "scramble" | "scrambleClear" | "pair" | "pairClear" | "piano" | "pianoClear" | "cleared";

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const scrambleText = (word: string): string[] => {
  const chars = word.split("");
  let shuffled = shuffleArray(chars);
  // 万一同じ並びにならないように
  if (shuffled.join("") === word && word.length > 1) {
    shuffled = [shuffled[1], shuffled[0], ...shuffled.slice(2)];
  }
  return shuffled;
};

const buildInitialCards = (): CardItem[] => {
  const cards: CardItem[] = [];
  PAIRS.forEach(pair => {
    cards.push({
      id: pair.id * 2,
      pairId: pair.id,
      content: pair.term,
      type: "term",
      flipped: false,
      matched: false,
    });
    cards.push({
      id: pair.id * 2 + 1,
      pairId: pair.id,
      content: pair.description,
      type: "description",
      flipped: false,
      matched: false,
    });
  });
  return shuffleArray(cards);
};

export default function KeywordMinigame() {
  const { departmentId, routeId } = useParams<{ departmentId: string; routeId: string }>();
  const navigate = useNavigate();
  const department = getDepartmentById(departmentId || "");
  const { switchTrack } = useBgm();
  const keyword = department?.keywordMode?.keywords.find(k => k.id === parseInt(routeId || "0"));

  const [miniStage, setMiniStage] = useState<MiniStage>("intro");

  // ステージ1: スクランブル
  const [scrambleIndex, setScrambleIndex] = useState(0);
  const [scrambleInput, setScrambleInput] = useState("");
  const [scrambleFeedback, setScrambleFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [scrambled, setScrambled] = useState<string[]>(() => scrambleText(SCRAMBLE_WORDS[0].word));

  // ステージ2: ペアマッチ
  const [cards, setCards] = useState<CardItem[]>(() => buildInitialCards());
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  // ステージ3: ピアノ
  const [pianoSongIndex, setPianoSongIndex] = useState(0);
  const [pianoProgress, setPianoProgress] = useState(0);
  const [pianoKeyFeedback, setPianoKeyFeedback] = useState<{ note: string; type: "correct" | "wrong" } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Web Audio でピアノ音を再生
  const playNote = (note: string) => {
    const keyData = PIANO_KEYS.find(k => k.note === note);
    if (!keyData) return;
    try {
      if (!audioContextRef.current) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AC();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = keyData.freq;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      oscillator.start(now);
      oscillator.stop(now + 0.5);
    } catch {
      // 無視
    }
  };

  useEffect(() => {
    switchTrack("field");
  }, [switchTrack]);

  // ゲーム3つすべてクリア
  useEffect(() => {
    if (miniStage === "cleared") {
      fireCorrectEffect();
      if (departmentId && keyword) {
        saveObtainedKeyword(departmentId, keyword.id, keyword.correctKeyword);
        clearKeywordStageProgress(departmentId, keyword.id);
      }
    }
  }, [miniStage, departmentId, keyword]);

  if (!department || !department.keywordMode || !keyword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>ミニゲームが見つかりません</CardTitle>
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

  const handleBack = () => {
    navigate(`/department/${departmentId}/keyword-hub`);
  };

  // ===== ステージ1: スクランブル =====
  const handleScrambleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = normalizeAnswer(scrambleInput);
    const correct = normalizeAnswer(SCRAMBLE_WORDS[scrambleIndex].word);
    if (user === correct) {
      setScrambleFeedback("correct");
      fireCorrectEffect();
      setTimeout(() => {
        if (scrambleIndex + 1 < SCRAMBLE_WORDS.length) {
          const next = scrambleIndex + 1;
          setScrambleIndex(next);
          setScrambleInput("");
          setScrambled(scrambleText(SCRAMBLE_WORDS[next].word));
          setScrambleFeedback(null);
        } else {
          setMiniStage("scrambleClear");
        }
      }, 800);
    } else {
      setScrambleFeedback("incorrect");
      setTimeout(() => setScrambleFeedback(null), 1500);
    }
  };

  // ===== ステージ2: ペアマッチ =====
  const handleCardClick = (cardId: number) => {
    if (busy) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, flipped: true } : c
    );
    setCards(newCards);
    const newSelected = [...selected, cardId];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      setBusy(true);
      const [id1, id2] = newSelected;
      const c1 = newCards.find(c => c.id === id1)!;
      const c2 = newCards.find(c => c.id === id2)!;

      if (c1.pairId === c2.pairId) {
        setTimeout(() => {
          const updated = cards.map(c =>
            c.id === id1 || c.id === id2 ? { ...c, flipped: true, matched: true } : c
          );
          setCards(updated);
          setSelected([]);
          setBusy(false);
          if (updated.every(c => c.matched)) {
            setTimeout(() => {
              fireCorrectEffect();
              setMiniStage("pairClear");
            }, 500);
          }
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === id1 || c.id === id2 ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          setBusy(false);
        }, 1200);
      }
    }
  };

  const handlePairReset = () => {
    setCards(buildInitialCards());
    setSelected([]);
    setMoves(0);
    setBusy(false);
  };

  // ===== ステージ3: ピアノ =====
  const handlePianoKeyClick = (note: string) => {
    playNote(note);
    const currentSong = PIANO_SONGS[pianoSongIndex];
    const expectedNote = currentSong.notes[pianoProgress];
    if (note === expectedNote) {
      setPianoKeyFeedback({ note, type: "correct" });
      setTimeout(() => setPianoKeyFeedback(null), 200);
      const next = pianoProgress + 1;
      if (next >= currentSong.notes.length) {
        fireCorrectEffect();
        // 次の曲があれば進む、なければクリア
        if (pianoSongIndex + 1 < PIANO_SONGS.length) {
          setTimeout(() => {
            setPianoSongIndex(pianoSongIndex + 1);
            setPianoProgress(0);
          }, 800);
        } else {
          setTimeout(() => setMiniStage("pianoClear"), 600);
        }
      } else {
        setPianoProgress(next);
      }
    } else {
      setPianoKeyFeedback({ note, type: "wrong" });
      setTimeout(() => {
        setPianoKeyFeedback(null);
        setPianoProgress(0);
      }, 800);
    }
  };

  // ===== 画面レンダリング =====

  // イントロ画面
  if (miniStage === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-4 border-yellow-400">
          <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-yellow-700" />
              <CardTitle className="text-xl">教育ミニゲーム</CardTitle>
            </div>
            <CardDescription className="text-base">
              3つのゲームをクリアしてキーワードを入手しよう！
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-300">
                <Shuffle className="w-6 h-6 text-yellow-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-900">① 単語スクランブル</h3>
                  <p className="text-sm text-gray-700">
                    バラバラの文字を並び替えて教育用語を完成させよう
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-300">
                <Puzzle className="w-6 h-6 text-blue-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900">② 教育ペアマッチ</h3>
                  <p className="text-sm text-gray-700">
                    教育用語と説明文のペアを揃える神経衰弱
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-300">
                <Music className="w-6 h-6 text-purple-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-purple-900">③ ピアノで童謡演奏</h3>
                  <p className="text-sm text-gray-700">
                    保育現場で歌われる童謡をピアノで演奏しよう
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setMiniStage("scramble")}
              className="w-full h-12 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              ゲームスタート！
            </Button>
            <Button variant="outline" className="w-full" onClick={handleBack}>
              <Home className="w-4 h-4 mr-2" />
              キーワードハブに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ステージ1: スクランブル
  if (miniStage === "scramble") {
    const current = SCRAMBLE_WORDS[scrambleIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-4 py-8">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <Home className="w-4 h-4 mr-2" />
              ハブへ戻る
            </Button>
            <Badge className="bg-yellow-600 text-white text-base px-3 py-1">
              {scrambleIndex + 1} / {SCRAMBLE_WORDS.length}
            </Badge>
          </div>

          <Card className="shadow-xl border-2 border-yellow-400">
            <CardHeader className="bg-gradient-to-r from-yellow-100 to-amber-100">
              <div className="flex items-center gap-2">
                <Shuffle className="w-6 h-6 text-yellow-700" />
                <CardTitle className="text-xl">① 単語スクランブル</CardTitle>
              </div>
              <CardDescription>文字を並び替えて用語を完成させよう</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
                <p className="text-xs text-yellow-700 mb-2 font-semibold">ヒント</p>
                <p className="text-sm text-gray-800">{current.hint}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
                {scrambled.map((char, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 flex items-center justify-center rounded-lg bg-white border-2 border-amber-400 text-2xl font-bold text-amber-900 shadow"
                  >
                    {char}
                  </div>
                ))}
              </div>

              <form onSubmit={handleScrambleSubmit} className="space-y-3">
                <Input
                  type="text"
                  value={scrambleInput}
                  onChange={e => setScrambleInput(e.target.value)}
                  placeholder="答えを入力..."
                  className="text-lg h-12"
                  autoFocus
                  disabled={scrambleFeedback === "correct"}
                />
                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-yellow-600 hover:bg-yellow-700"
                  disabled={!scrambleInput.trim() || scrambleFeedback === "correct"}
                >
                  回答する
                </Button>
              </form>

              {scrambleFeedback === "correct" && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="font-bold text-green-800">正解！</p>
                </div>
              )}
              {scrambleFeedback === "incorrect" && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="font-bold text-red-800">もう一度考えてみよう</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ステージ1クリア
  if (miniStage === "scrambleClear") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-4 border-green-400">
          <CardContent className="space-y-6 pt-8 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-green-900">ステージ1 クリア！</h2>
            <p className="text-lg text-gray-700">単語スクランブルを突破！</p>
            <Button
              onClick={() => setMiniStage("pair")}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Puzzle className="w-5 h-5 mr-2" />
              ステージ2へ進む
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ステージ2: ペアマッチ
  if (miniStage === "pair") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <Home className="w-4 h-4 mr-2" />
              ハブへ戻る
            </Button>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white text-base px-3 py-1">
                手数: {moves}
              </Badge>
              <Button variant="outline" size="sm" onClick={handlePairReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-blue-900 flex items-center justify-center gap-2">
              <Puzzle className="w-6 h-6" />
              ② 教育ペアマッチ
            </h2>
            <p className="text-sm text-gray-600">用語と説明のペアを揃えよう！</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {cards.map(card => {
              const isVisible = card.flipped || card.matched;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={busy || card.matched}
                  className={`aspect-[3/4] rounded-xl shadow-md transition-all duration-300 p-2 flex items-center justify-center text-center ${
                    isVisible
                      ? card.matched
                        ? "bg-green-100 border-4 border-green-500"
                        : card.type === "term"
                          ? "bg-yellow-200 border-4 border-yellow-500"
                          : "bg-blue-100 border-4 border-blue-400"
                      : "bg-gradient-to-br from-blue-400 to-purple-500 border-4 border-blue-600 hover:scale-105 active:scale-95"
                  }`}
                >
                  {isVisible ? (
                    <span
                      className={`font-bold leading-tight ${
                        card.type === "term" ? "text-base" : "text-xs"
                      } ${card.matched ? "text-green-900" : "text-gray-900"}`}
                    >
                      {card.content}
                    </span>
                  ) : (
                    <div className="text-4xl">❓</div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-800">
              🟡 用語カード ／ 🔵 説明文カード
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ステージ2クリア
  if (miniStage === "pairClear") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-4 border-green-400">
          <CardContent className="space-y-6 pt-8 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-green-900">ステージ2 クリア！</h2>
            <p className="text-lg text-gray-700">
              {moves} 手でペアマッチ突破！
            </p>
            <Button
              onClick={() => setMiniStage("piano")}
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Music className="w-5 h-5 mr-2" />
              ステージ3へ進む
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ステージ3: ピアノ
  if (miniStage === "piano") {
    const currentSong = PIANO_SONGS[pianoSongIndex];
    const progressPercent = (pianoProgress / currentSong.notes.length) * 100;
    const nextNote = currentSong.notes[pianoProgress];
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 py-8">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <Home className="w-4 h-4 mr-2" />
              ハブへ戻る
            </Button>
            <div className="flex items-center gap-2">
              <Badge className="bg-pink-600 text-white text-base px-3 py-1">
                曲 {pianoSongIndex + 1} / {PIANO_SONGS.length}
              </Badge>
              <Badge className="bg-purple-600 text-white text-base px-3 py-1">
                {pianoProgress} / {currentSong.notes.length}
              </Badge>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-purple-900 flex items-center justify-center gap-2">
              <Music className="w-6 h-6" />
              ③ ピアノで童謡演奏
            </h2>
            <p className="text-sm text-gray-600">「{currentSong.name}」を演奏しよう！</p>
          </div>

          <Progress value={progressPercent} className="h-3" />

          {/* 楽譜表示 */}
          <Card className="shadow-md border-2 border-purple-300">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-purple-700 font-semibold mb-2 text-center">
                楽譜（次は: {nextNote}）
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {currentSong.notes.map((note, i) => (
                  <div
                    key={i}
                    className={`w-8 h-10 flex items-center justify-center rounded text-sm font-bold border-2 ${
                      i < pianoProgress
                        ? "bg-green-200 border-green-500 text-green-900"
                        : i === pianoProgress
                          ? "bg-yellow-200 border-yellow-500 text-yellow-900 animate-pulse"
                          : "bg-gray-100 border-gray-300 text-gray-500"
                    }`}
                  >
                    {note}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 鍵盤 */}
          <div className="grid grid-cols-7 gap-2">
            {PIANO_KEYS.map(key => {
              const isFeedback = pianoKeyFeedback?.note === key.note;
              const feedbackClass = isFeedback
                ? pianoKeyFeedback?.type === "correct"
                  ? "ring-4 ring-green-500 scale-95"
                  : "ring-4 ring-red-500 scale-95"
                : "hover:scale-105 active:scale-95";
              return (
                <button
                  key={key.note}
                  onClick={() => handlePianoKeyClick(key.note)}
                  className={`aspect-[1/2] rounded-b-lg border-2 shadow-md transition-all ${key.color} ${feedbackClass}`}
                >
                  <div className="h-full flex items-end justify-center pb-3">
                    <span className="font-bold text-gray-800 text-lg">{key.note}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-purple-50 border border-purple-300 rounded-lg p-3 text-center">
            <p className="text-xs text-purple-800">
              楽譜の順番通りに鍵盤をタップしよう
            </p>
            <p className="text-xs text-gray-600 mt-1">
              間違えると最初からやり直し
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ステージ3クリア → 全体クリア
  if (miniStage === "pianoClear") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-4 border-purple-400">
          <CardContent className="space-y-6 pt-8 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-purple-500" />
            </div>
            <h2 className="text-3xl font-bold text-purple-900">ステージ3 クリア！</h2>
            <p className="text-lg text-gray-700">美しい演奏でした！</p>
            <Button
              onClick={() => setMiniStage("cleared")}
              className="w-full h-12 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Trophy className="w-5 h-5 mr-2" />
              すべてクリア！
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 全ゲームクリア → キーワード入手
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-green-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-4 border-yellow-400">
        <CardContent className="space-y-6 pt-8 text-center">
          <div className="flex justify-center">
            <Trophy className="w-20 h-20 text-yellow-500 animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-900">全ゲームクリア！</h1>
          <p className="text-lg text-gray-700">
            3つのミニゲームを見事突破しました！
          </p>

          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
            <div className="flex justify-center mb-3">
              <Key className="w-12 h-12 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">キーワード入手！</p>
            <p className="text-2xl font-bold text-gray-900">
              {keyword.correctKeyword}
            </p>
          </div>

          <Button
            onClick={handleBack}
            className="w-full h-12 text-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            キーワードハブに戻る
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
