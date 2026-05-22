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
  loopMode: 'all' | 'single';
  onToggleLoop: () => void;
  playOrder: 'sequential' | 'random';
  onTogglePlayOrder: () => void;
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
  loopMode,
  onToggleLoop,
  playOrder,
  onTogglePlayOrder,
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
        /* MINIMIZED MINIMALIST FLOATING CONTAINER - Sits snug at bottom of screen */
        <motion.div
          key="minimized-player"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-sm md:max-w-md bg-white/95 border border-zinc-200 p-3 rounded-2xl shadow-[0_12px_35px_rgba(0,0,0,0.15)] z-50 flex items-center justify-between gap-3 backdrop-blur-xl shrink-0 select-none border-b-2 cursor-pointer hover:border-[#1db954]/50 transition-colors"
        >
          {/* Cover and Name details */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-8 h-8 rounded-lg object-cover border border-zinc-100 shadow-sm"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded-lg">
                  <Disc size={12} className="text-[#1db954] animate-spin [animation-duration:3s]" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-[11px] md:text-xs truncate text-zinc-900">
                {currentTrack.title}
              </h4>
            </div>
          </div>

          {/* Symmetrical mini buttons */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="p-1 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <SkipBack size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              className="p-1 rounded bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer flex items-center justify-center w-6 h-6 shrink-0 active:scale-90 transition-transform"
            >
              {isPlaying ? <Pause size={12} fill="white" /> : <Play size={12} fill="white" className="ml-0.5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="p-1 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <SkipForward size={14} />
            </button>
            <div className="w-[1px] h-4 bg-zinc-200" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className="p-1 text-[#1db954] hover:text-[#20cf5d] transition-colors cursor-pointer"
              title="Expand player card"
            >
              <Maximize2 size={13} />
            </button>
          </div>

          {/* Thin Progress Slider on the edge */}
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-zinc-100 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1db954] to-[#20cf5d] shadow-[0_0_8px_rgba(29,185,84,0.4)] rounded-b-2xl"
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xs md:max-w-[340px] bg-white rounded-[1.75rem] border border-zinc-200 p-4 shadow-[0_15px_50px_rgba(0,0,0,0.1)] z-50 flex flex-col gap-3 text-zinc-800 hover:border-zinc-300 transition-colors backdrop-blur-2xl select-none"
        >
          {/* HEADER ROW */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative group shrink-0">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-11 h-11 rounded-xl object-cover shadow-sm border border-zinc-200"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded-xl">
                    <Disc size={16} className="text-[#1db954] animate-spin [animation-duration:4s]" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs md:text-sm text-zinc-900 truncate max-w-[140px] md:max-w-[170px]">
                  {currentTrack.title}
                </h4>
              </div>
            </div>

            {/* MINIMIZE BUTTON ONLY */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer rounded-lg"
                title="Minimize layout"
              >
                <Minimize2 size={15} />
              </button>
            </div>
          </div>

          {/* TIMELINE SLIDER */}
          <div className="flex flex-col gap-1 w-full mt-0.5">
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="font-mono text-[9px] text-zinc-500 w-8 text-right">
                {formatTime(currentTime)}
              </span>
              
              <div
                className="flex-1 relative h-1 bg-zinc-100 rounded-full group cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1db954] to-[#20cf5d] rounded-full shadow-[0_0_8px_rgba(29,185,84,0.2)]"
                  style={{ width: `${percent}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border border-[#1db954] shadow-sm transition-all group-hover:scale-125"
                  style={{ left: `calc(${percent}% - 5px)` }}
                />
              </div>

              <span className="font-mono text-[9px] text-zinc-500 w-8 text-left">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* MODERN HORIZONTAL CONTROL BAR */}
          <div className="flex items-center justify-between gap-0.5 w-full mt-0.5 px-0.5">
            {/* PLAY ORDER (SEQUENTIAL/RANDOM) BUTTON */}
            <button
              onClick={onTogglePlayOrder}
              className="border border-zinc-200 rounded-lg p-2 py-2.5 flex items-center justify-center cursor-pointer transition-all hover:border-zinc-300 bg-transparent text-zinc-500 hover:text-zinc-900 group"
            >
              <div className="flex items-center gap-1">
                <Shuffle size={14} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                <span className="text-[9px] font-bold uppercase pointer-events-none text-zinc-900 leading-none">
                  {playOrder === 'sequential' ? 'S' : 'R'}
                </span>
              </div>
            </button>

            {/* PREV BUTTON */}
            <button
              onClick={onPrev}
              className="border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 p-2 flex items-center justify-center cursor-pointer transition-all hover:border-zinc-300 bg-transparent"
            >
              <SkipBack size={14} />
            </button>

            {/* PLAY / PAUSE EXPANDED ACTION BUTTON */}
            <button
              onClick={onTogglePlay}
              className="border border-zinc-200 rounded-xl bg-zinc-900 text-white px-5 py-2.5 flex items-center justify-center cursor-pointer transition-all hover:bg-zinc-800 active:scale-95 shadow-sm shrink-0"
            >
              {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className={isRTL ? "" : "ml-0.5"} />}
            </button>

            {/* NEXT BUTTON */}
            <button
              onClick={onNext}
              className="border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 p-2 flex items-center justify-center cursor-pointer transition-all hover:border-zinc-300 bg-transparent"
            >
              <SkipForward size={14} />
            </button>

            {/* REPEAT LOOP BUTTON */}
            <button
              onClick={onToggleLoop}
              className="border border-zinc-200 rounded-lg p-2 px-3 flex items-center justify-center cursor-pointer transition-all hover:border-zinc-300 bg-transparent text-zinc-500 hover:text-zinc-900 group"
            >
              <div className="relative flex items-center justify-center">
                <Repeat size={18} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                <span className="absolute text-[8px] font-bold pointer-events-none text-zinc-900 mb-0.5">
                  {loopMode === 'all' ? 'A' : '1'}
                </span>
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
