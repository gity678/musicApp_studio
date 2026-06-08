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
  Disc,
  X
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
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  onHeightChange: (height: number) => void;
  liveSong?: string;
  onClose?: () => void;
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
  isExpanded,
  setIsExpanded,
  onHeightChange,
  liveSong = "",
  onClose,
}: BottomPlayerProps) {
  const isRTL = false;
  const t = translations[lang];
  const [isDragging, setIsDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState(0);

  const progressBarRefMin = React.useRef<HTMLDivElement>(null);
  const progressBarRefExp = React.useRef<HTMLDivElement>(null);

  const previousNodeRef = React.useRef<HTMLDivElement | null>(null);

  const playerRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      // Cleanup old observer if it exists
      if (previousNodeRef.current) {
        const oldObserver = (previousNodeRef.current as any)._observer;
        if (oldObserver) {
          oldObserver.disconnect();
          delete (previousNodeRef.current as any)._observer;
        }
      }

      previousNodeRef.current = node;

      if (node !== null) {
        const handleResize = () => {
          const rect = node.getBoundingClientRect();
          if (rect.height > 0) {
            onHeightChange(rect.height);
          }
        };
        
        handleResize();
        const observer = new ResizeObserver(handleResize);
        observer.observe(node);
        (node as any)._observer = observer;
      }
    },
    [onHeightChange]
  );

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const ref = isExpanded ? progressBarRefExp : progressBarRefMin;
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setDragPercent(progress);
    };

    const handleMouseUp = () => {
      onSeek(dragPercent * duration);
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragPercent, duration, onSeek, isExpanded]);

  if (!currentTrack || currentTrack.id.startsWith("yt-")) {
    return null; // Don't render player at all when there is no playing track or if it's a YouTube video
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayPercent = isDragging ? dragPercent * 100 : currentPercent;

  const handleStartDragging = (e: React.MouseEvent | React.TouchEvent, ref: React.RefObject<HTMLDivElement>) => {
    e.stopPropagation();
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    
    setIsDragging(true);
    setDragPercent(progress);
  };

  const isLive = currentTrack?.duration === "Live" || currentTrack?.id.startsWith("radio-");

  return (
    <AnimatePresence>
      {!isExpanded ? (
        /* MINIMIZED MINIMALIST FLOATING CONTAINER - Sits snug at bottom of screen */
        <motion.div
          key="minimized-player"
          ref={playerRef}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] sm:w-[calc(100%-2.5rem)] max-w-sm md:max-w-md bg-white/95 border border-zinc-200 p-2.5 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.15)] z-50 flex flex-col gap-1.5 backdrop-blur-2xl shrink-0 select-none cursor-pointer hover:bg-zinc-50 transition-all group"
        >
          <div className="flex items-center justify-between gap-3 w-full">
            {/* Cover and Name details */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-9 h-9 rounded-xl object-cover border border-zinc-100 shadow-sm"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-[13px] md:text-sm truncate text-zinc-900 group-hover:text-[#1db954] transition-colors leading-tight">
                  {currentTrack.title}
                </h4>
                {isLive ? (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <p className="text-[11px] text-zinc-600 font-medium truncate max-w-[200px]">
                      {liveSong || currentTrack.artist || currentTrack.album || "Connecting..."}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pink-500"></span>
                      </span>
                      <span className="text-[9px] font-bold text-pink-500 uppercase tracking-wider font-sans leading-none">
                        LIVE
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 font-medium truncate tracking-normal opacity-75 mt-0.5">
                    {currentTrack.artist || currentTrack.genre || "Music"}
                  </p>
                )}
              </div>
            </div>

            {/* Symmetrical mini buttons */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
                className="flex p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all cursor-pointer active:scale-90"
              >
                <SkipBack size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
                }}
                className="p-1 rounded-xl bg-zinc-900 text-white hover:bg-[#1db954] cursor-pointer flex items-center justify-center w-7 h-7 shrink-0 active:scale-90 transition-all shadow-md"
              >
                {isPlaying ? <Pause size={12} fill="white" /> : <Play size={12} fill="white" className="ml-0.5" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="flex p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all cursor-pointer active:scale-90"
              >
                <SkipForward size={16} />
              </button>
              <div className="w-[1px] h-5 bg-zinc-200 mx-0.5" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="p-1.5 text-[#1db954] hover:bg-[#1db954]/10 rounded-lg transition-all cursor-pointer"
                title="Expand player card"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose?.();
                }}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer ml-0.5"
                title="Close player"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* TIMELINE SLIDER OR LIVE RADIO INDICATOR */}
          {!isLive && (
            <div className="flex flex-col gap-1 w-full mt-0.5">
              <div className="flex items-center justify-between gap-2 w-full px-0.5">
                <span className="font-mono text-[9px] text-zinc-500 w-8 text-right shrink-0">
                  {formatTime(currentTime)}
                </span>
                
                <div 
                  ref={progressBarRefMin}
                  className="flex-1 relative h-1.5 bg-zinc-100 rounded-full group cursor-pointer touch-none" 
                  onMouseDown={(e) => handleStartDragging(e, progressBarRefMin)}
                  onTouchStart={(e) => handleStartDragging(e, progressBarRefMin)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1db954] to-[#20cf5d] rounded-full shadow-[0_0_8px_rgba(29,185,84,0.2)]"
                    style={{ width: `${displayPercent}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-2 border-[#1db954] shadow-md transition-transform group-hover:scale-110 active:scale-95"
                    style={{ left: `calc(${displayPercent}% - 7px)` }}
                  />
                </div>

                <span className="font-mono text-[9px] text-zinc-500 w-8 text-left shrink-0">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* EXPANDED FULL SYSTEM CARD PLAYER - FLOATS ON SCREEN */
        <motion.div
          key="expanded-player"
          ref={playerRef}
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] sm:w-[calc(100%-2.5rem)] max-w-sm md:max-w-md bg-white rounded-2xl border border-zinc-200 p-3 shadow-[0_15px_50px_rgba(0,0,0,0.1)] z-50 flex flex-col gap-2.5 text-zinc-800 hover:border-zinc-300 transition-colors backdrop-blur-2xl select-none"
        >
          {/* HEADER ROW */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative group shrink-0">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-10 h-10 rounded-xl object-cover shadow-sm border border-zinc-200"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs md:text-sm text-zinc-900 truncate">
                  {currentTrack.title}
                </h4>
                {isLive ? (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <p className="text-[11px] text-zinc-600 font-medium truncate max-w-[200px]">
                      {liveSong || currentTrack.artist || currentTrack.album || "Connecting..."}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pink-500"></span>
                      </span>
                      <span className="text-[9px] font-bold text-pink-500 uppercase tracking-wider font-sans leading-none">
                        LIVE
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 font-medium truncate tracking-normal opacity-75 mt-0.5">
                    {currentTrack.artist || currentTrack.genre || "Music"}
                  </p>
                )}
              </div>
            </div>

            {/* MINIMIZE AND CLOSE BUTTONS */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer rounded-lg"
                title="Minimize layout"
              >
                <Minimize2 size={15} />
              </button>
              <button
                onClick={() => onClose?.()}
                className="p-1.5 text-red-500 hover:bg-red-55 transition-colors cursor-pointer rounded-lg"
                title="Close player"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* TIMELINE SLIDER OR LIVE RADIO INDICATOR */}
          {!isLive && (
            <div className="flex flex-col gap-1 w-full mt-0.5">
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="font-mono text-[9px] text-zinc-500 w-8 text-right">
                  {formatTime(currentTime)}
                </span>
                
                <div
                  ref={progressBarRefExp}
                  className="flex-1 relative h-1.5 bg-zinc-100 rounded-full group cursor-pointer touch-none"
                  onMouseDown={(e) => handleStartDragging(e, progressBarRefExp)}
                  onTouchStart={(e) => handleStartDragging(e, progressBarRefExp)}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1db954] to-[#20cf5d] rounded-full shadow-[0_0_8px_rgba(29,185,84,0.2)]"
                    style={{ width: `${displayPercent}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-2 border-[#1db954] shadow-md transition-transform group-hover:scale-110 active:scale-95"
                    style={{ left: `calc(${displayPercent}% - 7px)` }}
                  />
                </div>

                <span className="font-mono text-[9px] text-zinc-500 w-8 text-left">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          )}

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
              className="border border-zinc-200 rounded-xl bg-zinc-900 text-white px-5 py-2 flex items-center justify-center cursor-pointer transition-all hover:bg-zinc-800 active:scale-95 shadow-sm shrink-0"
            >
              {isPlaying ? <Pause size={17} fill="white" /> : <Play size={17} fill="white" className={isRTL ? "" : "ml-0.5"} />}
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
