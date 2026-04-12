import confetti from "canvas-confetti";

/** 正解時のキラキラ紙吹雪エフェクト */
export function fireCorrectEffect() {
  // 中央から金色の紙吹雪
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#FFD700", "#FFA500", "#FF6347", "#32CD32", "#00BFFF"],
  });

  // 左右からも追加
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 50,
      origin: { x: 0, y: 0.6 },
      colors: ["#FFD700", "#FFA500"],
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 50,
      origin: { x: 1, y: 0.6 },
      colors: ["#FFD700", "#FFA500"],
    });
  }, 200);
}
