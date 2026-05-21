import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Play, FileAudio, Disc, Music, SlidersHorizontal } from "lucide-react";
import { Track } from "../types";

interface MusicTabProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  lang: "en" | "ar";
  translations: any;
  customTracks: Track[];
}

export default function MusicTab({
  tracks,
  currentTrack,
  isPlaying,
  onSelectTrack,
  lang,
  translations,
  customTracks,
}: MusicTabProps) {
  const isRTL = lang === "ar";
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const allTracks = [...tracks, ...customTracks];

  // Get unique genres
  const genres = ["all", ...Array.from(new Set(allTracks.map(t => t.genre.toLowerCase())))];

  const filteredTracks = allTracks.filter(
    (track) => {
      const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.genre.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGenre = activeFilter === "all" || track.genre.toLowerCase() === activeFilter;
      return matchesSearch && matchesGenre;
    }
  );

  return (
    <div className="space-y-4 md:space-y-8 pb-4 md:pb-12">
      {/* Filter Chips by Genre */}
      <div className="flex gap-2 pb-2 overflow-x-auto select-none no-scrollbar">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveFilter(genre)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === genre
                ? "bg-[#1db954] text-black shadow-md font-bold"
                : "bg-[#141419] border border-[#1e1e24] text-gray-400 hover:text-white"
            }`}
          >
            {genre === "all" ? (isRTL ? "الكل" : "All Tracks") : genre.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Grid: Main library & Info detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Track Library */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="font-sans font-bold text-lg text-white flex items-center gap-2">
              <Music className="text-[#1db954]" size={18} />
              <span>{isRTL ? "مكتبة الألحان والتراكات" : "Tracks Directory"}</span>
            </h2>
            {/* Search input */}
            <div className="relative w-full sm:w-72 bg-[#141419] border border-[#1e1e24] rounded-xl focus-within:border-[#1db954] transition-colors">
              <span className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-3" : "right-3"} text-gray-400`}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full bg-transparent px-4 py-2.5 text-xs text-white focus:outline-none ${isRTL ? "pl-10" : "pr-10"}`}
              />
            </div>
          </div>

          {/* Table List of tracks */}
          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl overflow-hidden backdrop-blur-md shadow-lg max-h-[350px] md:max-h-none overflow-y-auto no-scrollbar">
            {filteredTracks.length > 0 ? (
              <div className="divide-y divide-[#181820]">
                {filteredTracks.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => onSelectTrack(track)}
                      className={`flex items-center justify-between p-4 hover:bg-[#141419]/90 transition-all duration-300 cursor-pointer group ${
                        isCurrent ? "bg-[#1db954]/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="font-mono text-xs text-gray-500 w-5 text-center group-hover:hidden">
                          {idx + 1}
                        </span>
                        <div className="hidden group-hover:flex w-5 items-center justify-center animate-pulse">
                          <Play size={12} className={isCurrent ? "text-[#1db954]" : "text-white"} />
                        </div>
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-10 h-10 rounded-lg object-cover shadow border border-[#1e1e24] group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <h4
                            className={`font-semibold text-xs truncate transition-colors ${
                              isCurrent ? "text-[#1db954]" : "text-white group-hover:text-[#1db954]"
                            }`}
                          >
                            {track.title}
                          </h4>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-[10px] uppercase font-mono bg-[#141419] border border-[#1f1f26] px-2.5 py-0.5 rounded text-gray-400 shrink-0">
                          {track.genre}
                        </span>
                        <span className="font-mono text-xs text-gray-500 shrink-0">{track.duration}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 text-xs italic">{t.noTracks}</div>
            )}
          </div>
        </div>

        {/* Current Insight panel */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-6 backdrop-blur-md space-y-4 text-center">
            <h3 className="font-sans font-bold text-xs text-gray-400 uppercase tracking-widest text-left">
              {t.lyrics}
            </h3>
            {currentTrack ? (
              <div className="space-y-4">
                <div className="relative group mx-auto w-24 h-24">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full rounded-2xl object-cover shadow-2xl border border-[#1e1e24] animate-spin [animation-duration:15s]"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                    <Disc size={20} className="text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1db954]">{currentTrack.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{currentTrack.artist}</p>
                </div>
                <div className="text-[11px] text-gray-300 leading-relaxed italic bg-[#141419] p-3 rounded-xl border border-[#1e1e24] text-left">
                  {isRTL
                    ? "» نغتنم التجربة عبر إتاحة ألحان مرشحة بعناية تناسب القنوات والأجواء العميقة التي ترتكز على التفكير والاسترخاء والتعايش الذكي.«"
                    : "» Deep, atmospheric harmony engineered carefully with standard frequencies for mindfulness and perfect cognitive retention.«"}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-xs py-8 italic">{t.lyricsPlaceholder}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
