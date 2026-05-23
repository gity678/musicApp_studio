import { useState } from "react";
import { motion } from "motion/react";
import { Radio, Signal, Disc, Play, HelpCircle, RadioTower } from "lucide-react";
import { RadioStation } from "../types";

interface RadioTabProps {
  stations: RadioStation[];
  activeStation: RadioStation | null;
  isPlaying: boolean;
  onSelectStation: (station: RadioStation) => void;
  lang: "en" | "ar";
  translations: any;
}

export default function RadioTab({
  stations,
  activeStation,
  isPlaying,
  onSelectStation,
  lang,
  translations,
}: RadioTabProps) {
  const isRTL = lang === "ar";
  const t = translations[lang];
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  return (
    <div className="space-y-4 md:space-y-6 flex flex-col h-full overflow-hidden min-h-0">
      {/* Radio Header banner */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-r from-teal-950/20 via-slate-900/30 to-black border border-teal-500/10 p-4 md:p-8 shrink-0">
        <div className="relative z-10 max-w-2xl space-y-3 md:space-y-4">
          <span className="font-mono text-[10px] md:text-xs text-teal-400 uppercase tracking-widest font-semibold inline-block">
            {t.radioLive}
          </span>
          <h1 className="font-sans font-black text-2xl md:text-5xl tracking-tight text-white leading-tight">
            {isRTL ? "مذياع سبوتيفايّ المباشر" : "Global Live Radio Frequencies"}
          </h1>
          <p className="text-gray-300 text-xs md:text-sm hidden md:block">
            {isRTL
              ? "استمتع ببث حي فائق الجودة لمحطات راديو حصرية مخصصة وموسيقى هادئة دون فواصل إعلانية."
              : "Stream live internet radio feeds tuned specifically for lo-fi beats, chill waves, classic hits, and acoustic atmospheres."}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-[circle_at_right] from-teal-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Retro Signal & Frequency Dial */}
      <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-4 md:p-8 backdrop-blur-md">
        <h2 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4">
          {t.frequencyDial}
        </h2>

        {/* Dial display */}
        <div className="relative h-20 md:h-28 bg-[#070709] rounded-xl border border-[#1f1f26] overflow-hidden flex items-end justify-center px-4">
          {/* Signal Indicator */}
          <div className="absolute top-2 md:top-4 left-4 md:left-6 flex items-center gap-2">
            <Signal size={12} className={isPlaying && activeStation ? "text-teal-400 animate-pulse" : "text-gray-600"} />
            <span className="font-mono text-[9px] md:text-[10px] text-gray-500">
              {t.signalStrength}: {isPlaying && activeStation ? "EXCELLENT" : "STANDBY"}
            </span>
          </div>

          <div className="absolute top-2 md:top-4 right-4 md:right-6 flex items-center gap-2">
            <Radio size={12} className={isPlaying && activeStation ? "text-teal-400 animate-spin [animation-duration:8s]" : "text-gray-600"} />
            {activeStation && (
              <span className="font-mono text-[10px] md:text-[12px] font-bold text-teal-400">
                {activeStation.frequency}
              </span>
            )}
          </div>

          {/* Lines simulating tuner dial */}
          <div className="w-full h-12 md:h-16 flex items-end justify-between px-2 overflow-hidden select-none pointer-events-none">
            {Array.from({ length: 41 }).map((_, i) => {
              const matchesStation = activeStation && Math.abs(parseInt(activeStation.frequency) - (88 + i * 0.5)) < 1;
              return (
                <div
                  key={i}
                  className={`w-0.5 rounded-t transition-all duration-300 ${
                    i % 5 === 0 ? "h-10 md:h-14 bg-gray-500" : "h-6 md:h-8 bg-gray-700"
                  } ${matchesStation && isPlaying ? "h-12 md:h-16 bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" : ""}`}
                />
              );
            })}
          </div>

          {/* Orange Tuner Line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)] z-15 pointer-events-none" />
        </div>
      </div>

      {/* Radio grid list */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto no-scrollbar pb-2 min-h-0">
        {stations.map((station) => {
          const isCurrent = activeStation?.id === station.id;
          const isThisPlaying = isCurrent && isPlaying;
          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station)}
              onMouseEnter={() => setHoveredStation(station.id)}
              onMouseLeave={() => setHoveredStation(null)}
              className={`bg-[#0c0c0e]/60 border rounded-2xl p-6 flex gap-5 items-start cursor-pointer hover:bg-[#121216]/90 group transition-all duration-300 ${
                isCurrent ? "border-teal-500/30 bg-teal-500/5" : "border-[#1e1e24]"
              }`}
            >
              {/* Cover Art layout */}
              <div className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-[#23232e]">
                <img
                  src={station.logoUrl}
                  alt={station.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={24} className="text-white fill-white" />
                </div>
                {isThisPlaying && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <RadioTower size={24} className="text-teal-400 animate-bounce" />
                  </div>
                )}
              </div>

              {/* Station details */}
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full font-bold">
                    {station.frequency}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest truncate">
                    {station.genre}
                  </span>
                </div>
                <h3
                  className={`font-bold text-sm truncate uppercase tracking-tight text-white ${
                    isCurrent ? "text-teal-400" : "group-hover:text-teal-400"
                  }`}
                >
                  {station.name}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed truncate-2-lines line-clamp-2">
                  {station.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
