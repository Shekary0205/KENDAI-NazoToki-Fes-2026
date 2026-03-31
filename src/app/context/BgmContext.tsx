import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from "react";

export type BgmTrack = "gym" | "field" | "trainer" | "battle" | "victory";

interface BgmContextValue {
  isPlaying: boolean;
  currentTrack: BgmTrack;
  toggleBgm: () => void;
  switchTrack: (track: BgmTrack) => void;
}

const BgmContext = createContext<BgmContextValue | null>(null);

const TRACKS: Record<BgmTrack, string> = {
  gym: "/audio/pokemon-gym.wav",
  field: "/audio/tokiwa-forest.wav",
  trainer: "/audio/trainer-appears.wav",
  battle: "/audio/vs-gym-leader.wav",
  victory: "/audio/victory.wav",
};

export function BgmProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const trackRef = useRef<BgmTrack>("gym");
  const [currentTrack, setCurrentTrack] = useState<BgmTrack>("gym");

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(TRACKS[trackRef.current]);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    return audioRef.current;
  }, []);

  const toggleBgm = useCallback(() => {
    const audio = getAudio();

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const expectedSrc = new URL(TRACKS[trackRef.current], window.location.origin).href;
      if (audio.src !== expectedSrc) {
        audio.src = TRACKS[trackRef.current];
      }
      audio.play().catch((err) => console.error("BGM再生失敗:", err));
      setIsPlaying(true);
    }
  }, [isPlaying, getAudio]);

  const switchTrack = useCallback(
    (track: BgmTrack) => {
      if (track === trackRef.current) return;

      trackRef.current = track;
      setCurrentTrack(track);

      const audio = getAudio();
      const wasPlaying = !audio.paused;

      if (wasPlaying) {
        audio.pause();
      }

      audio.src = TRACKS[track];
      audio.currentTime = 0;

      if (wasPlaying) {
        audio.play().catch((err) => console.error("BGM切替失敗:", err));
      }
    },
    [getAudio]
  );

  return (
    <BgmContext.Provider value={{ isPlaying, currentTrack, toggleBgm, switchTrack }}>
      {children}
    </BgmContext.Provider>
  );
}

export function useBgm() {
  const ctx = useContext(BgmContext);
  if (!ctx) throw new Error("useBgm must be used within BgmProvider");
  return ctx;
}
