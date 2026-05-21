import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Play, FileAudio, Disc, Plus, Check } from "lucide-react";
import { Track } from "../types";

interface MusicTabProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  lang: "en" | "ar";
  translations: any;
  customTracks: Track[];
  onAddCustomTrack: (title: string, artist: string, url: string) => void;
}

export default function MusicTab({
  tracks,
  currentTrack,
  isPlaying,
  onSelectTrack,
  lang,
  translations,
  customTracks,
  onAddCustomTrack,
}: MusicTabProps) {
  const isRTL = lang === "ar";
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customArtist, setCustomArtist] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const allTracks = [...tracks, ...customTracks];

  const filteredTracks = allTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const title = customTitle.trim() || `External Stream #${customTracks.length + 1}`;
    const artist = customArtist.trim() || "Web Source";
    onAddCustomTrack(title, artist, customUrl.trim());
    setCustomTitle("");
    setCustomArtist("");
    setCustomUrl("");
    setStatusMessage(t.addedToQueue);
    setTimeout(() => setStatusMessage(""), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Poster Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1db954]/20 via-[#0a2e16]/30 to-black border border-[#1db954]/10 p-8 md:p-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="font-mono text-xs text-[#1db954] uppercase tracking-widest font-semibold">
            {t.appName} Premium Live
          </span>
          <h1 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-white leading-tight">
            {isRTL ? "موسيقاك بجودة فائقة ونقاء تام" : "Immersive Soundscape Experience"}
          </h1>
          <p className="text-gray-300 text-sm md:text-base">
            {isRTL
              ? "استكشف أروع الألحان الحرة المنسقة مع معالجة ذكية ومؤثرات صوتية فريدة من نوعها."
              : "Discover hand-picked cinematic tunes, retro themes, and organic instrumentals integrated with high-fidelity streaming."}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-[circle_at_right] from-[#1db954]/10 to-transparent pointer-events-none" />
      </div>

      {/* Grid: Main library & Custom stream loader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Track Library */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <h2 className="font-sans font-bold text-xl text-white">{t.music}</h2>
            {/* Search input */}
            <div className="relative w-full md:w-72 bg-[#141419] border border-[#1e1e24] rounded-xl focus-within:border-[#1db954] transition-colors">
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
          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl overflow-hidden backdrop-blur-md">
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
                        <div className="hidden group-hover:flex w-5 items-center justify-center">
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
                        <span className="text-[10px] uppercase font-mono bg-[#141419] border border-[#1f1f26] px-2 py-0.5 rounded text-gray-400 shrink-0">
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

        {/* Custom Stream Input & Current Insight panel */}
        <div className="space-y-6">
          {/* Custom stream downloader panel */}
          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3">
              <FileAudio size={18} className="text-[#1db954]" />
              <h3 className="font-sans font-bold text-sm text-white">{t.customUrl}</h3>
            </div>
            <form onSubmit={handleAddCustom} className="space-y-3">
              <input
                type="text"
                placeholder={isRTL ? "عنوان المقطع الموسيقي..." : "Enter stream title..."}
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-[#141419] border border-[#1e1e24] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1db954]"
              />
              <input
                type="text"
                placeholder={isRTL ? "مثال: المغني أو الملحن..." : "Enter artist name..."}
                value={customArtist}
                onChange={(e) => setCustomArtist(e.target.value)}
                className="w-full bg-[#141419] border border-[#1e1e24] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1db954]"
              />
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  placeholder={t.customUrlPlaceholder}
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 bg-[#141419] border border-[#1e1e24] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1db954]"
                />
                <button
                  type="submit"
                  className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#1db954] hover:text-white active:scale-95 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus size={14} />
                  <span>{t.customAddBtn}</span>
                </button>
              </div>
            </form>
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-[#1db954] text-xs font-semibold"
              >
                <Check size={14} />
                <span>{statusMessage}</span>
              </motion.div>
            )}
          </div>

          {/* Insight details panel about the track */}
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
                    className="w-full h-full rounded-2xl object-cover shadow-2xl border border-[#1e1e24]+ animate-spin [animation-duration:15s]"
                  />
                  <div className="absolute inset-0 bg-radial-gradient/40 rounded-2xl flex items-center justify-center">
                    <Disc size={20} className="text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1db954]">{currentTrack.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{currentTrack.artist}</p>
                </div>
                <div className="text-[11px] text-gray-300 leading-relaxed italic bg-[#141419] p-3 rounded-xl border border-[#1e1e24] text-left">
                  {isRTL ? "» نغمات مرشحة بعناية تناسب القنوات والأجواء العميقة التي ترتكز على التفكير والاسترخاء والتعايش الذكي.«" : "» Deep, atmospheric harmony engineered carefully with standard frequencies for mindfulness and perfect cognitive retention.«"}
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
