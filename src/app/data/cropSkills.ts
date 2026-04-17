/**
 * 作物バトル用: 進化ごとのスキルカード & パッシブ特性定義
 */

import { computeBaseEvolution, type CropState } from "./departments-data";

// ===== スキルカード効果タイプ =====
export type CardEffect =
  | { type: "damage"; amount: number }                    // 敵に固定ダメ
  | { type: "heal"; amount: number }                       // 自分のHP回復
  | { type: "attackBuff"; multiplier: number }             // 次の攻撃倍率
  | { type: "shield"; multiplier: number }                 // 次の被ダメ軽減
  | { type: "reduceOptions"; count: number }               // 次の問題の選択肢を減らす
  | { type: "skipQuestion"; damage: number }               // 問題スキップ&自動ダメ
  | { type: "gainEnergy"; amount: number }                 // エネルギー獲得
  | { type: "combo"; damage: number; energy: number };     // ダメ+エネ両方

export interface SkillCard {
  id: string;
  name: string;
  icon: string;
  energyCost: number;
  description: string;
  effect: CardEffect;
}

// ===== パッシブ特性タイプ =====
export type PassiveId =
  | "none"
  | "autoHeal"           // HP30%以下で毎ターン+10
  | "chainAttack"        // 連続正解で攻撃+20%/回
  | "evadeWrong"         // 不正解時50%で回避
  | "firstHit"           // 最初の攻撃が必中+2倍
  | "startEnergy"        // バトル開始時Energy+2
  | "wrongReduce"        // 不正解ダメージ半減
  | "revive"             // 死亡時に1度だけHP50%で復活
  | "lowHpBoost"         // HP50%以下で攻撃+100%
  | "clairvoyance";      // 全問題で選択肢-1

export interface Passive {
  id: PassiveId;
  name: string;
  description: string;
}

// ===== カード定義 =====
const C = {
  heal: { id: "heal", name: "癒しの花粉", icon: "💚", energyCost: 3, description: "HP +30 回復", effect: { type: "heal" as const, amount: 30 } },
  shield: { id: "shield", name: "かばう", icon: "🛡️", energyCost: 2, description: "次の被ダメージ半減", effect: { type: "shield" as const, multiplier: 0.5 } },
  bigHit: { id: "bigHit", name: "根本の一撃", icon: "💥", energyCost: 4, description: "敵に40ダメージ", effect: { type: "damage" as const, amount: 40 } },
  doubleNext: { id: "doubleNext", name: "連撃", icon: "🔥", energyCost: 3, description: "次の正解ダメージ2倍", effect: { type: "attackBuff" as const, multiplier: 2 } },
  weakpoint: { id: "weakpoint", name: "弱点看破", icon: "🔍", energyCost: 3, description: "次の問題の選択肢-2", effect: { type: "reduceOptions" as const, count: 2 } },
  skip: { id: "skip", name: "スキップ", icon: "⏭️", energyCost: 4, description: "問題スキップ&25ダメ", effect: { type: "skipQuestion" as const, damage: 25 } },
  charm: { id: "charm", name: "魅了の一撃", icon: "💫", energyCost: 5, description: "敵に60ダメージ固定", effect: { type: "damage" as const, amount: 60 } },
  knowledge: { id: "knowledge", name: "必殺の知略", icon: "📖", energyCost: 4, description: "50ダメ+選択肢-1", effect: { type: "damage" as const, amount: 50 } }, // reduceOptions は別途
  elegant: { id: "elegant", name: "優雅な戦術", icon: "🎩", energyCost: 3, description: "HP+20+次ダメ軽減", effect: { type: "heal" as const, amount: 20 } },
  blessing: { id: "blessing", name: "祝福の光", icon: "✨", energyCost: 5, description: "HP全回復", effect: { type: "heal" as const, amount: 999 } },
  aegis: { id: "aegis", name: "天使の加護", icon: "🌟", energyCost: 3, description: "次のダメージを完全無効化", effect: { type: "shield" as const, multiplier: 0 } },
  explosion: { id: "explosion", name: "必殺爆裂", icon: "💣", energyCost: 6, description: "敵に80ダメージ", effect: { type: "damage" as const, amount: 80 } },
  insight: { id: "insight", name: "全能洞察", icon: "🧠", energyCost: 5, description: "選択肢-3", effect: { type: "reduceOptions" as const, count: 3 } },
  // 心アイテム系
  teacherLight: { id: "teacherLight", name: "教育の光", icon: "📘", energyCost: 4, description: "HP+30+次被ダメ半減", effect: { type: "heal" as const, amount: 30 } },
  fisherCatch: { id: "fisherCatch", name: "大漁の一撃", icon: "🎣", energyCost: 4, description: "30ダメ+エネ+3", effect: { type: "combo" as const, damage: 30, energy: 3 } },
  warriorRage: { id: "warriorRage", name: "戦士の怒り", icon: "⚔️", energyCost: 3, description: "次の攻撃+100%", effect: { type: "attackBuff" as const, multiplier: 2 } },
};

// ===== 基本進化 → カードセット =====
const BASE_EVO_CARDS: Record<string, SkillCard[]> = {
  "優しさフラワー":   [C.heal, C.shield],
  "強さフラワー":     [C.bigHit, C.doubleNext],
  "賢さフラワー":     [C.weakpoint, C.skip],
  "イケメンフラワー": [C.heal, C.bigHit, C.charm],
  "賢者フラワー":     [C.bigHit, C.weakpoint, C.knowledge],
  "紳士フラワー":     [C.heal, C.weakpoint, C.elegant],
  "天使フラワー":     [C.heal, C.blessing, C.aegis],
  "最強フラワー":     [C.bigHit, C.doubleNext, C.explosion],
  "天才フラワー":     [C.weakpoint, C.skip, C.insight],
};

// ===== 心アイテムID → 追加カード =====
const HEART_BONUS_CARD: Record<string, SkillCard> = {
  "agr-teacher-heart": C.teacherLight,
  "agr-fisher-heart":  C.fisherCatch,
  "agr-warrior-heart": C.warriorRage,
};

// ===== 基本進化 → パッシブ =====
const BASE_EVO_PASSIVE: Record<string, Passive> = {
  "優しさフラワー":   { id: "autoHeal",      name: "自然治癒",     description: "HP 30%以下で毎ターン+10HP" },
  "強さフラワー":     { id: "chainAttack",   name: "連撃の才",     description: "連続正解で攻撃+20%（累積）" },
  "賢さフラワー":     { id: "evadeWrong",    name: "博識回避",     description: "不正解時50%でダメージ無効" },
  "イケメンフラワー": { id: "firstHit",      name: "先制の美",     description: "最初の攻撃が必中+2倍" },
  "賢者フラワー":     { id: "startEnergy",   name: "先見の明",     description: "バトル開始時にエネルギー+2" },
  "紳士フラワー":     { id: "wrongReduce",   name: "紳士の余裕",   description: "不正解時のダメージを半減" },
  "天使フラワー":     { id: "revive",        name: "天使の祝福",   description: "死亡時1度だけHP50%で復活" },
  "最強フラワー":     { id: "lowHpBoost",    name: "背水の陣",     description: "HP 50%以下で攻撃+100%" },
  "天才フラワー":     { id: "clairvoyance",  name: "透視",         description: "全ての問題で選択肢が1つ減る" },
};

// ===== ヘルパー関数 =====

/** 作物の進化に応じたカードセットを返す */
export const getCardsForCrop = (state: CropState): SkillCard[] => {
  const base = state.usedHeartId && state.baseEvoAtHeartUse
    ? state.baseEvoAtHeartUse
    : computeBaseEvolution(state);
  if (!base) return [];
  const baseCards = BASE_EVO_CARDS[base] ?? [];
  const heartCard = state.usedHeartId ? HEART_BONUS_CARD[state.usedHeartId] : null;
  return heartCard ? [...baseCards, heartCard] : baseCards;
};

/** 作物のパッシブを返す */
export const getPassiveForCrop = (state: CropState): Passive => {
  const base = state.usedHeartId && state.baseEvoAtHeartUse
    ? state.baseEvoAtHeartUse
    : computeBaseEvolution(state);
  if (!base) return { id: "none", name: "—", description: "進化するとパッシブが解放されます" };
  return BASE_EVO_PASSIVE[base] ?? { id: "none", name: "—", description: "—" };
};

// ===== 定数 =====
export const MAX_ENERGY = 10;
export const ENERGY_PER_CORRECT = 2;
