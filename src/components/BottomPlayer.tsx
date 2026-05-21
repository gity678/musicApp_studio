import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Maximize2,
  Minimize2,
  Disc
} from "lucide-react";
import { Track } from "../types";

interface BottomPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  loop: boolean;
  onToggleLoop: () => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  themePreset: string;
  onSetThemePreset: (preset: string) => void;
  lang: "en" | "ar";
  translations: any;
  showVisualizer: boolean;
  setShowVisualizer: (val: boolean) => void;
}

export default function BottomPlayer({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  currentTime,
  duration,
  onSeek,
  loop,
  onToggleLoop,
  shuffle,
  onToggleShuffle,
  themePreset,
  onSetThemePreset,
  lang,
  translations,
  showVisualizer,
  setShowVisualizer,
}: BottomPlayerProps) {
  const isRTL = lang === "ar";
  const t = translations[lang];
  const [isExpanded, setIsExpanded] = useState(true);

  if (!currentTrack) {
    return null; // Don't render player at all when there is no playing track
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = Math.max(0, Math.min(1, clickX / width));
    onSeek(clickPercent * duration);
  };

  return (
    <AnimatePresence>
      {!isExpanded ? (
        /* MINIMIZED MINIMALIST PLAYER - Attached flush to the bottom browser edge */
        <motion.div
          key="minimized-player"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0c1517]/95 border-t border-x border-[#192a2d] p-3 rounded-t-2xl shadow-[0_-10px_35px_rgba(0,0,0,0.85)] z-50 flex items-center justify-between gap-3 backdrop-blur-xl shrink-0 select-none pb-4 md:pb-3"
        >
          {/* Cover and Name details */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-8 h-8 rounded-lg object-cover border border-[#1a2d30] shadow-md"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                  <Disc size={12} className="text-pink-500 animate-spin [animation-duration:3s]" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-[11px] md:text-xs truncate text-white">
                {currentTrack.title}
              </h4>
              <p className="text-[9px] md:text-[10px] text-teal-400/80 truncate mt-0.5">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Symmetrical mini buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <SkipBack size={14} />
            </button>
            <button
              onClick={onTogglePlay}
              className="p-1 rounded bg-white text-black hover:bg-zinc-200 cursor-pointer flex items-center justify-center w-6 h-6 shrink-0 active:scale-90 transition-transform"
            >
              {isPlaying ? <Pause size={12} fill="black" /> : <Play size={12} fill="black" className="ml-0.5" />}
            </button>
            <button
              onClick={onNext}
              className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <SkipForward size={14} />
            </button>
            <div className="w-[1px] h-4 bg-[#1a2d30]" />
            <button
              onClick={() => setIsExpanded(true)}
              className="p-1 text-teal-400 hover:text-white transition-colors cursor-pointer"
              title="Expand player card"
            >
              <Maximize2 size={13} />
            </button>
          </div>

          {/* Thin Pink Progress Slider on the top edge of bottom bar */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#102022] overflow-hidden rounded-t-2xl">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
              style={{ width: `${percent}%` }}
            />
          </div>
        </motion.div>
      ) : (
        /* EXPANDED FULL SYSTEM CARD PLAYER - FLOATS ON SCREEN */
        <motion.div
          key="expanded-player"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xs md:max-w-[340px] bg-[#0c1517] rounded-[1.75rem] border border-[#192a2d] p-4 shadow-[0_15px_50px_rgba(0,0,0,0.85)] z-50 flex flex-col gap-3 text-white hover:border-[#223d42]/70 transition-colors backdrop-blur-2xl select-none"
        >
          {/* HEADER ROW */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative group shrink-0">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-11 h-11 rounded-xl object-cover shadow-lg border border-[#1a2d30]"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                    <Disc size={16} className="text-pink-500 animate-spin [animation-duration:4s]" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs md:text-sm text-white truncate max-w-[140px] md:max-w-[170px]">
                  {currentTrack.title}
                </h4>
                <p className="text-[10px] md:text-[11px] text-teal-400/80 truncate mt-0.5">{currentTrack.artist}</p>
              </div>
            </div>

            {/* MINIMIZE BUTTON ONLY */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-lg"
                title="Minimize layout"
              >
                <Minimize2 size={15} />
              </button>
            </div>
          </div>

          {/* TIMELINE SLIDER */}
          <div className="flex flex-col gap-1 w-full mt-0.5">
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="font-mono text-[9px] text-teal-400/80 w-8 text-right">
                {formatTime(currentTime)}
              </span>
              
              <div
                className="flex-1 relative h-1 bg-[#17272a] rounded-full group cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                  style={{ width: `${percent}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border border-pink-500 shadow-lg transition-all group-hover:scale-125"
                  style={{ left: `calc(${percent}% - 5px)` }}
                />
              </div>

              <span className="font-mono text-[9px] text-teal-400/80 w-8 text-left">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* MODERN HORIZONTAL CONTROL BAR */}
          <div className="flex items-center justify-between gap-0.5 w-full mt-0.5 px-0.5">
            {/* SHUFFLE BUTTON */}
            <button
              onClick={onToggleShuffle}
              className={`border border-[#1a2d30] rounded-lg p-2 flex items-center justify-center cursor-pointer transition-all hover:border-[#203c41] bg-transparent ${
                shuffle ? "text-pink-500 border-pink-500/55 shadow-[0_0_6px_rgba(244,63,94,0.2)] bg-pink-500/10" : "text-gray-400 hover:text-white"
              }`}
            >
              <Shuffle size={12} />
            </button>

            {/* PREV BUTTON */}
            <button
              onClick={onPrev}
              className="border border-[#1a2d30] rounded-lg text-gray-400 hover:text-white p-2 flex items-center justify-center cursor-pointer transition-all hover:border-[#203c41] bg-transparent"
            >
              <SkipBack size={12} />
            </button>

            {/* PLAY / PAUSE EXPANDED ACTION BUTTON */}
            <button
              onClick={onTogglePlay}
              className="border border-[#1a2d30] rounded-xl bg-[#0d1719]/45 text-white px-5 py-2.5 flex items-center justify-center cursor-pointer transition-all hover:border-pink-500 hover:bg-white/5 active:scale-95 shadow-[0_4px_12px_rgba(244,63,94,0.15)] shrink-0"
            >
              {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className={isRTL ? "" : "ml-0.5"} />}
            </button>

            {/* NEXT BUTTON */}
            <button
              onClick={onNext}
              className="border border-[#1a2d30] rounded-lg text-gray-400 hover:text-white p-2 flex items-center justify-center cursor-pointer transition-all hover:border-[#203c41] bg-transparent"
            >
              <SkipForward size={12} />
            </button>

            {/* REPEAT LOOP BUTTON */}
            <button
              onClick={onToggleLoop}
              className={`border border-[#1a2d30] rounded-lg p-2 flex items-center justify-center cursor-pointer transition-all hover:border-[#203c41] bg-transparent ${
                loop ? "text-pink-500 border-pink-500/55 shadow-[0_0_6px_rgba(244,63,94,0.2)] bg-pink-500/10" : "text-gray-400 hover:text-white"
              }`}
            >
              <Repeat size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
