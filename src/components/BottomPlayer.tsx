import { useState } from "react";
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
  Disc
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
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);

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

  return (
    <div className="bg-[#09090b]/95 border-t border-[#1e1e24] p-4 text-white flex flex-col md:flex-row items-center justify-between gap-4 select-none relative z-40 backdrop-blur-md">
      {/* Wave progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#1a1a24] cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const clickPercent = clickX / width;
        onSeek(clickPercent * duration);
      }}>
        <motion.div
          className="h-full bg-gradient-to-r from-[#1db954] to-[#27eb60] shadow-[0_0_8px_rgba(29,185,84,0.6)]"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* LEFT: Track details */}
      <div className="flex items-center gap-4 w-full md:w-1/4">
        {currentTrack ? (
          <>
            <div className="relative group shrink-0">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-14 h-14 rounded-lg object-cover shadow-lg border border-[#1e1e24]"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <Disc size={20} className="text-[#1db954] animate-spin [animation-duration:4s]" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm truncate text-white hover:text-[#1db954] cursor-pointer">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-gray-400 truncate mt-0.5">{currentTrack.artist}</p>
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-xs italic">{t.noRadioPlaying}</div>
        )}
      </div>

      {/* CENTER: Player controls & progress text */}
      <div className="flex flex-col items-center gap-2 w-full md:w-2/4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={onToggleShuffle}
            className={`p-1.5 transition-colors cursor-pointer ${
              shuffle ? "text-[#1db954]" : "text-gray-400 hover:text-white"
            }`}
          >
            <Shuffle size={16} />
          </button>

          <button
            onClick={onPrev}
            className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_4px_12px_rgba(255,255,255,0.2)] cursor-pointer"
          >
            {isPlaying ? <Pause size={22} fill="black" /> : <Play size={22} fill="black" className={isRTL ? "" : "ml-0.5" } />}
          </button>

          <button
            onClick={onNext}
            className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={onToggleLoop}
            className={`p-1.5 transition-colors cursor-pointer ${
              loop ? "text-[#1db954]" : "text-gray-400 hover:text-white"
            }`}
          >
            <Repeat size={16} />
          </button>
        </div>

        {/* Timeline Text */}
        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="font-mono text-[10px] text-gray-500 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative h-1 bg-[#1a1a24] rounded-full group cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickPercent = clickX / rect.width;
            onSeek(clickPercent * duration);
          }}>
            <div
              className="absolute top-0 left-0 h-full bg-[#1db954] group-hover:bg-[#27eb60] rounded-full"
              style={{ width: `${percent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${percent}% - 5px)` }}
            />
          </div>
          <span className="font-mono text-[10px] text-gray-500 w-10 text-left">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* RIGHT: Volume & EQ Panels */}
      <div className="flex items-center justify-end gap-4 w-full md:w-1/4">
        {/* Canvas Visualizer Toggle */}
        <button
          onClick={() => setShowVisualizer(!showVisualizer)}
          title={t.visualizer}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            showVisualizer
              ? "bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/30"
              : "text-gray-400 hover:text-white hover:bg-[#18181b]"
          }`}
        >
          <Sparkle size={16} />
        </button>

        {/* Equalizer Presets Dropup */}
        <div className="relative">
          <button
            onClick={() => setIsEqOpen(!isEqOpen)}
            title={t.equalizer}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isEqOpen
                ? "bg-[#18181b] text-[#1db954] border border-[#1e1e24]"
                : "text-gray-400 hover:text-white hover:bg-[#18181b]"
            }`}
          >
            <Sliders size={16} />
          </button>

          <AnimatePresence>
            {isEqOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsEqOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className={`absolute bottom-12 ${
                    isRTL ? "left-0" : "right-0"
                  } bg-[#0c0c0e] border border-[#1e1e24] rounded-xl p-3 w-48 shadow-2xl z-50`}
                >
                  <h5 className="text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-2">
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
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                          themePreset === preset.id
                            ? "bg-[#1db954]/10 text-[#1db954]"
                            : "text-gray-300 hover:bg-[#18181b] hover:text-white"
                        }`}
                      >
                        <span>{preset.name}</span>
                        {themePreset === preset.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1db954]" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2 group/vol">
          <button onClick={handleMuteToggle} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
            className="w-20 md:w-24 h-1 bg-[#1a1a24] rounded-full appearance-none accent-[#1db954] cursor-pointer hover:accent-[#27eb60] transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
