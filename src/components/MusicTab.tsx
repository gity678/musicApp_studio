import React, { useState, useEffect } from "react";
import { Disc, Play } from "lucide-react";
import { Track } from "../types";

// Dynamic track duration resolver component
function TrackDuration({ audioUrl, fallback }: { audioUrl: string; fallback: string }) {
  const [duration, setDuration] = useState<string>("...");

  useEffect(() => {
    // If we already have a real numeric duration representation (like 3:20 instead of Cloud/Direct), use it immediately
    if (fallback && fallback !== "Cloud" && fallback !== "Direct") {
      setDuration(fallback);
      return;
    }

    const audio = new Audio(audioUrl);
    
    const handleLoadedMetadata = () => {
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      if (!isNaN(minutes) && !isNaN(seconds)) {
        setDuration(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
      } else {
        setDuration("3:20"); // fallback standard
      }
    };

    const handleError = () => {
      setDuration("3:15"); // simple preset backup
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);
    audio.preload = "metadata";

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      audio.src = "";
    };
  }, [audioUrl, fallback]);

  return <span className="font-mono text-xs text-zinc-500 shrink-0">{duration}</span>;
}

interface MusicTabProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  lang: "en";
  translations: any;
  customTracks: Track[];
  searchTerm: string;
}

export default function MusicTab({
  tracks,
  currentTrack,
  onSelectTrack,
  lang,
  translations,
  customTracks,
  searchTerm,
}: MusicTabProps) {
  const t = translations[lang];

  const allTracks = [...tracks, ...customTracks];

  // Filter tracks only based on the global top-bar searchTerm (title & artist)
  const filteredTracks = allTracks.filter((track) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      track.title.toLowerCase().includes(term) ||
      track.artist.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4 md:space-y-8 pb-4 md:pb-12 text-zinc-800">
      {/* Grid: Main library & Info detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Track Library */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Table List of tracks */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm max-h-[350px] md:max-h-none overflow-y-auto no-scrollbar">
            {filteredTracks.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {filteredTracks.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => onSelectTrack(track)}
                      className={`flex items-center justify-between p-4 hover:bg-zinc-50 transition-all duration-300 cursor-pointer group ${
                        isCurrent ? "bg-[#1db954]/10" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="font-mono text-xs text-zinc-400 w-5 text-center group-hover:hidden">
                          {idx + 1}
                        </span>
                        <div className="hidden group-hover:flex w-5 items-center justify-center animate-pulse">
                          <Play size={12} className={isCurrent ? "text-[#1db954]" : "text-zinc-600"} />
                        </div>
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-10 h-10 rounded-lg object-cover shadow-sm border border-zinc-100 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <h4
                            className={`font-semibold text-xs truncate transition-colors ${
                              isCurrent ? "text-[#1db954] font-bold" : "text-zinc-800 group-hover:text-[#1db954]"
                            }`}
                          >
                            {track.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <TrackDuration audioUrl={track.audioUrl} fallback={track.duration} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-400 text-xs italic">{t.noTracks}</div>
            )}
          </div>
        </div>

        {/* Current Insight panel */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4 text-center">
            <h3 className="font-sans font-bold text-xs text-zinc-400 uppercase tracking-widest text-left">
              {t.lyrics}
            </h3>
            {currentTrack ? (
              <div className="space-y-4">
                <div className="relative group mx-auto w-24 h-24">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full rounded-2xl object-cover shadow-md border border-zinc-100 animate-spin [animation-duration:15s]"
                  />
                  <div className="absolute inset-0 bg-black/10 rounded-2xl flex items-center justify-center">
                    <Disc size={20} className="text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1db954]">{currentTrack.title}</h4>
                </div>
                <div className="text-[11px] text-zinc-600 leading-relaxed italic bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-left">
                  {"» Deep, atmospheric harmony engineered carefully with standard frequencies for mindfulness and perfect cognitive retention. «"}
                </div>
              </div>
            ) : (
              <div className="text-zinc-400 text-xs py-8 italic">{t.lyricsPlaceholder}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
