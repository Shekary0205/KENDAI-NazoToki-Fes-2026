/**
 * 戦闘後ミニゲーム: 会話イベント & じゃんけん
 */

import { computeBaseEvolution, type CropState } from "./departments-data";

// ===== 会話イベント =====
export interface DialogueChoice {
  text: string;
  reply: string;
}

export interface DialogueSet {
  opening: string;
  choices: DialogueChoice[];
}

const DIALOGUES: Record<string, DialogueSet> = {
  "優しさフラワー": {
    opening: "ふぅ…疲れたね。一緒に戦ってくれてありがとう。",
    choices: [
      { text: "こちらこそ！", reply: "えへへ、うれしい…ずっと一緒だよ🌸" },
      { text: "大丈夫？", reply: "大丈夫、君の優しさで元気が湧いてきた。" },
      { text: "よく頑張ったね", reply: "褒めてくれてありがとう…胸があったかい。" },
    ],
  },
  "強さフラワー": {
    opening: "フッ…こんな敵、まだまだ序の口だぜ！",
    choices: [
      { text: "次も勝とう！", reply: "当然だ！オレと君なら無敵さ！💪" },
      { text: "筋肉ついた？", reply: "おっ、気づいてくれたか！毎日鍛えてるからな！" },
      { text: "ちょっと休もう", reply: "……仕方ねえな。少しだけだぞ。" },
    ],
  },
  "賢さフラワー": {
    opening: "今回の戦闘データは実に興味深かった…分析の余地があるね。",
    choices: [
      { text: "どう分析するの？", reply: "敵の選択肢パターンには5つの特徴があってだな…（長話）" },
      { text: "次どうする？", reply: "統計的には次の敵は強敵。準備が必要だ。" },
      { text: "すごい頭脳だね", reply: "フフ、当然のことを言わないでほしい…照れる。" },
    ],
  },
  "イケメンフラワー": {
    opening: "Hey、ベイビー。オレの活躍、しっかり見ていたかい？",
    choices: [
      { text: "キマってた！", reply: "Of course. オレはいつだってスタイリッシュさ💫" },
      { text: "ナルシストだね", reply: "ナルじゃない、自信だ。愛しているんだ、自分を。" },
      { text: "疲れた？", reply: "オレが疲れるわけないだろう？…でもちょっとだけ、肩もんで？" },
    ],
  },
  "賢者フラワー": {
    opening: "……ふむ。戦いは無数の選択の結晶だ。",
    choices: [
      { text: "哲学的だね", reply: "人生も戦いも、結局は問いの連続なのだよ。" },
      { text: "何か学んだ？", reply: "敵の動きから、次のステージの鍵が見えた。" },
      { text: "ありがとう", reply: "礼には及ばぬ。共に歩む友よ。" },
    ],
  },
  "紳士フラワー": {
    opening: "Bravo。実に優雅な勝利でしたね。",
    choices: [
      { text: "お疲れさま", reply: "これしき、当然のこと。紅茶でも淹れましょうか？🎩" },
      { text: "紳士的だね", reply: "恐縮です。淑女には常に礼を尽くすのが私の流儀。" },
      { text: "一杯どう？", reply: "喜んで。アールグレイで構いませんか？" },
    ],
  },
  "天使フラワー": {
    opening: "君が無事でよかった…神の加護がありますように。",
    choices: [
      { text: "ありがとう", reply: "君の心はとても美しい。それが私の力の源なの。" },
      { text: "神の声？", reply: "聞こえるよ。君を祝福する穏やかな声が。" },
      { text: "一緒に祈ろう", reply: "ええ、共に。世界に優しさが満ちますように…✨" },
    ],
  },
  "最強フラワー": {
    opening: "ハハハ！あの程度の敵、瞬殺だったぜ！",
    choices: [
      { text: "まだいける？", reply: "当たり前だ！10連戦でも余裕だぜ！💥" },
      { text: "落ち着いて", reply: "オレが落ち着いたら最強じゃなくなっちまう！" },
      { text: "一番強い！", reply: "そうだろう？君を守るために最強でいるのさ。" },
    ],
  },
  "天才フラワー": {
    opening: "既に次の敵の攻略パターンを3通り考案済みだ。",
    choices: [
      { text: "天才すぎる", reply: "ああ、自分でもそう思う。IQは測定不能だ。🧠" },
      { text: "教えて？", reply: "…簡略化すると、まず正解率の期待値が…（数式連発）" },
      { text: "一緒に考えよう", reply: "共同研究か…悪くない。君の直感が鍵になるかも。" },
    ],
  },
};

/** 作物に対応する会話を返す */
export const getDialogueForCrop = (state: CropState): DialogueSet => {
  const base = state.usedHeartId && state.baseEvoAtHeartUse
    ? state.baseEvoAtHeartUse
    : computeBaseEvolution(state);
  if (!base || !DIALOGUES[base]) {
    return {
      opening: "やったね！一緒に頑張ったね。",
      choices: [
        { text: "ありがとう", reply: "うん、こちらこそ！" },
        { text: "お疲れさま", reply: "君もお疲れさま！" },
        { text: "次も頑張ろう", reply: "もちろん！" },
      ],
    };
  }
  return DIALOGUES[base];
};

// ===== じゃんけん =====
export type Hand = "rock" | "paper" | "scissors";
export type JankenResult = "win" | "lose" | "draw";

export const HAND_INFO: Record<Hand, { icon: string; label: string }> = {
  rock: { icon: "✊", label: "グー" },
  paper: { icon: "✋", label: "パー" },
  scissors: { icon: "✌️", label: "チョキ" },
};

/** 作物の進化に応じてじゃんけんの手を偏らせる */
export const getCropHand = (state: CropState): Hand => {
  const base = state.usedHeartId && state.baseEvoAtHeartUse
    ? state.baseEvoAtHeartUse
    : computeBaseEvolution(state);
  // 重み付き抽選（強さ→グー多め / 賢さ→チョキ多め / 優しさ→パー多め）
  const weights: Record<Hand, number> = { rock: 1, paper: 1, scissors: 1 };
  switch (base) {
    case "強さフラワー":   weights.rock = 3; break;
    case "最強フラワー":   weights.rock = 4; break;
    case "賢さフラワー":   weights.scissors = 3; break;
    case "天才フラワー":   weights.scissors = 4; break;
    case "優しさフラワー": weights.paper = 3; break;
    case "天使フラワー":   weights.paper = 4; break;
    case "イケメンフラワー": weights.rock = 2; weights.paper = 2; break;
    case "賢者フラワー":   weights.rock = 2; weights.scissors = 2; break;
    case "紳士フラワー":   weights.paper = 2; weights.scissors = 2; break;
  }
  const total = weights.rock + weights.paper + weights.scissors;
  const r = Math.random() * total;
  if (r < weights.rock) return "rock";
  if (r < weights.rock + weights.paper) return "paper";
  return "scissors";
};

/** プレイヤーと作物のじゃんけん勝敗判定 */
export const judgeJanken = (player: Hand, crop: Hand): JankenResult => {
  if (player === crop) return "draw";
  const beats: Record<Hand, Hand> = { rock: "scissors", paper: "rock", scissors: "paper" };
  return beats[player] === crop ? "win" : "lose";
};
