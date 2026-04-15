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

/** アクシデント回避時の星エフェクト（正解時とは異なる演出） */
export function fireAccidentClearEffect() {
  const defaults = {
    spread: 360,
    ticks: 60,
    gravity: 0,
    decay: 0.94,
    startVelocity: 25,
    shapes: ["star" as const],
    colors: ["#FFFFFF", "#A7F3D0", "#6EE7B7", "#34D399", "#E0F2FE"],
  };

  // 中央から星が全方向に広がる
  confetti({
    ...defaults,
    particleCount: 50,
    scalar: 1.1,
    origin: { x: 0.5, y: 0.5 },
  });

  // 少し遅れて追加の星
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 30,
      scalar: 0.8,
      origin: { x: 0.5, y: 0.5 },
    });
  }, 150);
}
