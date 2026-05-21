import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Sliders,
  Maximize2,
  Minimize2,
  Sparkle,
  Disc,
  Heart
} from "lucide-react";
import { Track } from "../types";

interface BottomPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
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
  volume,
  onVolumeChange,
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
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
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

  const handleMuteToggle = () => {
    if (isMuted) {
      onVolumeChange(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const eqPresets = [
    { id: "flat", name: t.presetFlat },
    { id: "bass", name: t.presetBass },
    { id: "vocal", name: t.presetVocal },
    { id: "chill", name: t.presetChill },
  ];

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
        /* MINIMIZED MINIMALIST FLOATING CONTAINER - Sits elevated slightly above bottom browser bar */
        <motion.div
          key="minimized-player"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm md:max-w-md bg-[#0c1517]/95 border border-[#192a2d] p-3 rounded-2xl shadow-[0_12px_35px_rgba(0,0,0,0.85)] z-50 flex items-center justify-between gap-3 backdrop-blur-xl shrink-0 select-none border-b-2"
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

          {/* Thin Pink Progress Slider on the edge */}
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#102022] rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] rounded-b-2xl"
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm md:max-w-[420px] bg-[#0c1517] rounded-[2.25rem] border border-[#192a2d] p-5 md:p-6 shadow-[0_15px_50px_rgba(0,0,0,0.85)] z-50 flex flex-col gap-4 text-white hover:border-[#223d42]/70 transition-colors backdrop-blur-2xl select-none"
        >
          {/* HEADER ROW DETAILED IN COMPANION ARTWORK */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="relative group shrink-0">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-[#1a2d30]"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                    <Disc size={20} className="text-pink-500 animate-spin [animation-duration:4s]" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm md:text-base text-white truncate max-w-[160px] md:max-w-[200px]">
                  {currentTrack.title}
                </h4>
                <p className="text-[11px] md:text-xs text-teal-400/80 truncate mt-0.5">{currentTrack.artist}</p>
              </div>
            </div>

            {/* HEART TOGGLE & INTERACTIVE MINIMIZE UTILS */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isLiked ? "text-pink-500 scale-110" : "text-gray-400 hover:text-white"
                }`}
              >
                <Heart size={18} fill={isLiked ? "#f43f5e" : "transparent"} strokeWidth={isLiked ? 0 : 2} />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-xl"
                title="Minimize layout"
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          {/* PINK ACCENT TIMELINE SLIDER WITH BOTH BOUNDS TIME TAGS */}
          <div className="flex flex-col gap-1 w-full mt-1">
            <div className="flex items-center justify-between gap-3 w-full">
              <span className="font-mono text-[10px] text-teal-400/80 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              
              <div
                className="flex-1 relative h-1.5 bg-[#17272a] rounded-full group cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                  style={{ width: `${percent}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border border-pink-500 shadow-xl transition-all group-hover:scale-125"
                  style={{ left: `calc(${percent}% - 7px)` }}
                />
              </div>

              <span className="font-mono text-[10px] text-teal-400/80 w-10 text-left">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* MODERN HORIZONTAL CONTROL BAR */}
          <div className="flex items-center justify-between gap-1 w-full mt-1 px-1">
            {/* SHUFFLE BUTTON */}
            <button
              onClick={onToggleShuffle}
              className={`border border-[#1a2d30] rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all hover:border-[#203c41] bg-transparent ${
                shuffle ? "text-pink-500 border-pink-500/55 shadow-[0_0_8px_rgba(244,63,94,0.2)] bg-pink-500/10" : "text-gray-400 hover:text-white"
              }`}
            >
              <Shuffle size={14} />
            </button>

            {/* PREV BUTTON */}
            <button
              onClick={onPrev}
              className="border border-[#1a2d30] rounded-xl text-gray-400 hover:text-white p-3 flex items-center justify-center cursor-pointer transition-all hover:border-[#203c41] bg-transparent"
            >
              <SkipBack size={14} />
            </button>

            {/* PLAY / PAUSE EXPANDED ACTION BUTTON */}
            <button
              onClick={onTogglePlay}
              className="border-2 border-[#1a2d30] rounded-2xl bg-[#0d1719]/45 text-white px-7 py-4.5 flex items-center justify-center cursor-pointer transition-all hover:border-pink-500 hover:bg-white/5 active:scale-95 shadow-[0_4px_15px_rgba(244,63,94,0.15)] shrink-0"
            >
              {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className={isRTL ? "" : "ml-0.5"} />}
            </button>

            {/* NEXT BUTTON */}
            <button
              onClick={onNext}
              className="border border-[#1a2d30] rounded-xl text-gray-400 hover:text-white p-3 flex items-center justify-center cursor-pointer transition-all hover:border-[#203c41] bg-transparent"
            >
              <SkipForward size={14} />
            </button>

            {/* REPEAT LOOP BUTTON */}
            <button
              onClick={onToggleLoop}
              className={`border border-[#1a2d30] rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all hover:border-[#203c41] bg-transparent ${
                loop ? "text-pink-500 border-pink-500/55 shadow-[0_0_8px_rgba(244,63,94,0.2)] bg-pink-500/10" : "text-gray-400 hover:text-white"
              }`}
            >
              <Repeat size={14} />
            </button>
          </div>

          {/* SUB-UTILITIES TOGGLE ROW: VISUALIZER, EQ, VOLUME CHANNELS */}
          <div className="flex items-center justify-between border-t border-[#1a2d30]/50 pt-3 mt-1 text-[11px] text-gray-400">
            {/* Visualizer Toggle */}
            <button
              onClick={() => setShowVisualizer(!showVisualizer)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                showVisualizer ? "text-pink-400 bg-pink-500/10" : "hover:text-white"
              }`}
            >
              <Sparkle size={12} />
              <span>{t.visualizer}</span>
            </button>

            {/* Equalizer Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsEqOpen(!isEqOpen);
                  setIsVolumeOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isEqOpen ? "text-teal-400 bg-teal-500/10" : "hover:text-white"
                }`}
              >
                <Sliders size={12} />
                <span>Preset</span>
              </button>

              <AnimatePresence>
                {isEqOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsEqOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#0d1719] border border-[#192a2d] rounded-xl p-2.5 w-40 shadow-2xl z-50 text-white"
                    >
                      <h5 className="text-[9px] font-mono text-teal-400 uppercase tracking-wider mb-2 text-center">
                        {t.equalizer}
                      </h5>
                      <div className="space-y-1">
                        {eqPresets.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              onSetThemePreset(preset.id);
                              setIsEqOpen(false);
                            }}
                            className={`w-full text-center px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                              themePreset === preset.id
                                ? "bg-teal-500/10 text-teal-300"
                                : "text-gray-300 hover:bg-[#132326] hover:text-white"
                            }`}
                          >
                            <span>{preset.name}</span>
                            {themePreset === preset.id && (
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Volume Quick Slider Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsVolumeOpen(!isVolumeOpen);
                  setIsEqOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  volume === 0 || isMuted ? "text-red-400" : "hover:text-white"
                }`}
              >
                {isMuted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
                <span>{Math.round(volume * 100)}%</span>
              </button>

              <AnimatePresence>
                {isVolumeOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsVolumeOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#0d1719] border border-[#192a2d] rounded-xl p-3 w-36 shadow-2xl z-50 text-white flex flex-col items-center gap-2"
                    >
                      <button
                        onClick={handleMuteToggle}
                        className="text-gray-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5"
                      >
                        {isMuted || volume === 0 ? <VolumeX size={12} className="text-red-400" /> : <Volume2 size={12} />}
                        <span>{isMuted ? "Unmute" : "Mute"}</span>
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(e) => {
                          onVolumeChange(parseFloat(e.target.value));
                          if (parseFloat(e.target.value) > 0) {
                            setIsMuted(false);
                          }
                        }}
                        className="w-full h-1 bg-[#152427] rounded-full appearance-none accent-pink-500 cursor-pointer"
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
