import { useEffect } from "react";
import { motion } from "motion/react";

interface OpeningProps {
  onComplete: () => void;
}

export default function Opening({ onComplete }: OpeningProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); // 4秒後にメイン画面へ

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-blue-400 flex items-center justify-center overflow-hidden relative">
      {/* 背景の装飾的な円 */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
      />

      <div className="relative z-10 text-center px-4 space-y-8">
        {/* 大学名 */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2
            className="text-2xl md:text-3xl text-white/90 font-light tracking-wider mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            高崎健康福祉大学
          </motion.h2>
        </motion.div>

        {/* イベント名 - 文字を一つずつアニメーション */}
        <div className="space-y-4">
          <motion.div
            className="flex justify-center items-center gap-1 md:gap-2 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {["K", "E", "N", "D", "A", "I"].map((letter, index) => (
              <motion.span
                key={index}
                className="text-5xl md:text-7xl font-bold text-white"
                initial={{ opacity: 0, y: 50, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  delay: 0.8 + index * 0.1,
                  duration: 0.5,
                  ease: "backOut",
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>

          <motion.h1
            className="text-3xl md:text-5xl font-bold text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.6, ease: "backOut" }}
          >
            謎解きフェス2026
          </motion.h1>
        </div>

        {/* サブタイトル */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
        >
          <p className="text-lg md:text-xl text-white/80 tracking-wide">
            新入生歓迎 学内探索型イベント
          </p>
        </motion.div>

        {/* 装飾的な線 */}
        <motion.div
          className="flex justify-center gap-2 pt-4"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          transition={{ delay: 2.6, duration: 0.6 }}
        >
          <motion.div
            className="h-1 bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ delay: 2.6, duration: 0.4 }}
          />
          <motion.div
            className="h-1 bg-white/60 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ delay: 2.7, duration: 0.4 }}
          />
          <motion.div
            className="h-1 bg-white/30 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 20 }}
            transition={{ delay: 2.8, duration: 0.4 }}
          />
        </motion.div>

        {/* ローディングインジケーター */}
        <motion.div
          className="pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
        >
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-white rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* 全体のフェードアウト */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 0.5 }}
      />
    </div>
  );
}