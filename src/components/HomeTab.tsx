import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Play, Flame, Disc, BarChart2, RadioTower, Music, ArrowLeft, ArrowRight } from "lucide-react";
import { Track, RadioStation } from "../types";

interface HomeTabProps {
  tracks: Track[];
  stations: RadioStation[];
  onSelectTrack: (track: Track) => void;
  onSelectStation: (station: RadioStation) => void;
  lang: "en" | "ar";
  translations: any;
  setActiveTab: (tab: string) => void;
}

export default function HomeTab({
  tracks,
  stations,
  onSelectTrack,
  onSelectStation,
  lang,
  translations,
  setActiveTab,
}: HomeTabProps) {
  const isRTL = lang === "ar";
  const t = translations[lang];

  return (
    <div className="space-y-4 md:space-y-8 pb-4 md:pb-12">
      {/* Dynamic Welcome Premium Hero Banner */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-emerald-950/30 to-[#070709] border border-emerald-500/10 p-4 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3 md:space-y-4">
          <span className="font-mono text-[10px] md:text-xs text-[#1db954] uppercase tracking-widest font-bold bg-[#1db954]/10 border border-[#1db954]/20 px-3 py-1 rounded-full inline-block">
            {isRTL ? "مستوى هولستيك الصوتي" : "Holistic Studio Level 320 KBPS"}
          </span>
          <h1 className="font-sans font-black text-2xl md:text-5xl tracking-tight text-white leading-tight">
            {isRTL ? "أهلاً بك في منصة سبوتيفايّ" : "Welcome back to Spotifyy"}
          </h1>
          <p className="text-gray-300 text-xs md:text-sm leading-relaxed hidden md:block">
            {isRTL
              ? "بوابة تحويل وتلقي وبث الموسيقى الخاصة بك. استعرض مكتبات الموسيقى، استمع للبث الحي للراديو، ارفع تراكات الصوت أو أضف محطات راديو مخصصة لك بالكامل."
              : "Your decentralized high-fidelity hub. Smoothly navigate curated libraries, stream global live radios, host physical files, and generate custom soundwave dials on the fly."}
          </p>

          <div className="pt-2 flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={() => setActiveTab("music")}
              className="bg-[#1db954] text-black hover:bg-[#27eb60] px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold transition-all duration-300 transform active:scale-95 shadow-[0_4px_12px_rgba(29,185,84,0.3)] cursor-pointer flex items-center gap-1.5"
            >
              <span>{isRTL ? "مكتبتي الموسيقية" : "Explore Music"}</span>
              {isRTL ? <ArrowLeft size={12} className="scale-x-[-1]" /> : <ArrowRight size={12} />}
            </button>
            <button
              onClick={() => setActiveTab("radio")}
              className="border border-[#1e1e24] text-white hover:bg-[#121216] px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[11px] md:text-xs font-semibold transition-all duration-300 cursor-pointer"
            >
              {isRTL ? "دليل الراديو" : "Radio Dials"}
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-[circle_at_right] from-[#1db954]/15 to-transparent pointer-events-none" />
      </div>

      {/* Grid: Stat widgets & System parameters - Hidden on mobile to avoid vertical clutter */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Track count */}
        <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-[#1db954]/30 transition-all duration-300">
          <div className="absolute top-4 right-4 text-gray-700 group-hover:text-[#1db954]/20 transition-colors">
            <Music size={28} />
          </div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">{t.totalTracks}</span>
          <span className="font-sans font-black text-3xl text-white mt-1 block">{tracks.length}</span>
          <p className="text-[11px] text-[#1db954] mt-1 font-mono font-medium">✨ High fidelity active</p>
        </div>

        {/* Stat Radios */}
        <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-teal-500/30 transition-all duration-300">
          <div className="absolute top-4 right-4 text-gray-700 group-hover:text-teal-500/20 transition-colors">
            <RadioTower size={28} />
          </div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">{t.radioStations}</span>
          <span className="font-sans font-black text-3xl text-white mt-1 block">{stations.length}</span>
          <p className="text-[11px] text-teal-400 mt-1 font-mono font-medium">📡 Frequency online</p>
        </div>

        {/* Stat Codec quality */}
        <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Active Sound Engine</span>
          <span className="font-mono font-black text-xl text-white mt-2 block">Web Audio API</span>
          <p className="text-[11px] text-gray-400 mt-1">Bitrate: 320 kbps High quality stereo</p>
        </div>

        {/* Stat Active Equalizer */}
        <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Signal Codec State</span>
          <span className="font-mono font-black text-xl text-[#1db954] mt-2 block animate-pulse">● STABLE 100%</span>
          <p className="text-[11px] text-gray-400 mt-1">HMR: Off (Agent safe-mode active)</p>
        </div>
      </div>

      {/* Grid: Recommended Instant Play cards & AI conduct portal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Curated quick list cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-sans font-extrabold text-lg text-white flex items-center gap-2">
            <Flame size={18} className="text-red-500 animate-pulse" />
            <span>{t.recentActivity}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracks.slice(0, 4).map((track) => (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className="bg-[#0c0c0e]/40 border border-[#1e1e24] hover:bg-[#121216]/80 hover:border-white/10 rounded-2xl p-4 flex gap-4 items-center cursor-pointer transition-all duration-300 group shadow-md"
              >
                <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-[#21212d]">
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={18} className="text-white fill-white" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono uppercase bg-[#141419] px-2 py-0.5 rounded text-gray-400">
                    {track.genre}
                  </span>
                  <h3 className="font-bold text-xs text-white truncate mt-1.5 group-hover:text-[#1db954] transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick radio shortcuts on home tab */}
          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-6 backdrop-blur-md space-y-4">
            <h3 className="font-sans font-bold text-xs text-gray-400 uppercase tracking-widest">
              {isRTL ? "محطات راديو مقترحة للبث الآن" : "Top Live Stations To Stream Now"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stations.slice(0, 2).map((station) => (
                <div
                  key={station.id}
                  onClick={() => onSelectStation(station)}
                  className="bg-[#141419]/50 border border-[#1e1e24] hover:border-teal-500/30 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <img src={station.logoUrl} className="w-8 h-8 rounded-md object-cover" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-teal-400 truncate">{station.name}</h4>
                      <p className="text-[10px] text-gray-500">{station.frequency}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono uppercase text-teal-400 font-bold bg-teal-500/10 px-2.5 py-1 rounded-full animate-pulse">
                    LIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Minimal AI Tuner block */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0c0c0e] to-emerald-950/20 border border-[#1e1e24] rounded-2xl p-6 backdrop-blur-md space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-emerald-400 animate-pulse" />
              <h3 className="font-sans font-bold text-sm text-white">{t.aiAssistant}</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {isRTL
                ? "هل تريد العثور على ألحان معينة؟ انقر على زر منسق الموسيقى الذكي لتوليد قوائم تشغيل مخصصة لمزاجك فوراً بجهاز Gemini الفريد."
                : "Generate ambient soundtracks tailored instantly to your creative work context. Fire up the custom Conductor module."}
            </p>
            <button
              onClick={() => setActiveTab("ai")}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-500 font-semibold px-4 py-3 rounded-xl text-xs transition-all duration-300 active:scale-95 shadow-[0_4px_12px_rgba(16,185,129,0.2)] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>{isRTL ? "افتح المنسق الموسيقي" : "Launch AI Composer"}</span>
            </button>
          </div>

          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-6 text-center backdrop-blur-md space-y-2">
            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Disc size={20} className="animate-spin [animation-duration:5s]" />
            </div>
            <h4 className="font-bold text-xs text-white">Lossless High Resolution</h4>
            <p className="text-[11px] text-gray-400 leading-normal">
              {isRTL
                ? "مشغل سبوتيفايّ يدعم بثاً صوتياً نقياً لجميع ملفات الويب الحية ومحركات البث المباشرة."
                : "Supports raw audio buffers, direct MP3 loaders, webcasts, and direct YouTube compression layers."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
