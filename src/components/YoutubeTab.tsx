import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Search, Play, Youtube, Eye, Bookmark, Heart, Plus, Trash2 } from "lucide-react";
import { YouTubeVideo, Track } from "../types";

interface YoutubeTabProps {
  lang: "en" | "ar";
  translations: any;
  onPlayYoutube: (videoId: string, title: string, artist: string, cover: string) => void;
  savedYoutubeTracks: Track[];
  onAddYoutubeToCollection: (video: YouTubeVideo) => void;
  onRemoveYoutubeFromCollection: (trackId: string) => void;
}

export default function YoutubeTab({
  lang,
  translations,
  onPlayYoutube,
  savedYoutubeTracks,
  onAddYoutubeToCollection,
  onRemoveYoutubeFromCollection,
}: YoutubeTabProps) {
  const isRTL = lang === "ar";
  const t = translations[lang];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/youtube/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await response.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (e) {
      console.error("YouTube search error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const playVideo = (video: YouTubeVideo) => {
    setActiveVideoId(video.id);
    onPlayYoutube(
      video.id,
      video.title,
      video.channelTitle,
      video.thumbnailUrl
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* YouTube Stream Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/20 via-slate-900/30 to-black border border-red-500/10 p-8 md:p-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="font-mono text-xs text-red-500 uppercase tracking-widest font-semibold flex items-center gap-2">
            <Youtube size={16} />
            <span>YouTube Audio integration</span>
          </span>
          <h1 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-white leading-tight">
            {isRTL ? "البحث والتشغيل الفوري عبر يوتيوب" : "Stream YouTube Music Directly"}
          </h1>
          <p className="text-gray-300 text-sm md:text-base">
            {isRTL
              ? "ابحث عن أي مقطع أو أغنية على يوتيوب واستمع إليها كبث صوتي نقي في مشغلك التفاعلي."
              : "Search the entire catalog of YouTube, play streams on our custom panel, and curate them into your local visual playlist library."}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-[circle_at_right] from-red-500/10 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search and Results */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative bg-[#141419] border border-[#1e1e24] rounded-xl focus-within:border-red-500 transition-colors">
              <span className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-3" : "right-3"} text-gray-400`}>
                <Search size={16} />
              </span>
              <input
                type="text"
                required
                placeholder={t.searchYoutubePlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`w-full bg-transparent px-4 py-3 text-xs text-white focus:outline-none ${isRTL ? "pl-10" : "pr-10"}`}
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-red-700 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>{t.search}</span>
            </button>
          </form>

          {/* Active Live YouTube Embed */}
          {activeVideoId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video rounded-2xl overflow-hidden border border-red-500/20 bg-black shadow-2xl"
            >
              <iframe
                id="yt-player"
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </motion.div>
          )}

          {/* Search Result Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((video) => {
                const isPlayingThis = activeVideoId === video.id;
                return (
                  <div
                    key={video.id}
                    className={`bg-[#0c0c0e]/60 border rounded-xl overflow-hidden p-3.5 flex gap-4 hover:bg-[#141419] transition-colors duration-300 group ${
                      isPlayingThis ? "border-red-500/30 bg-red-500/5" : "border-[#1e1e24]"
                    }`}
                  >
                    <div className="relative shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-[#1e1e24]">
                      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <button
                        onClick={() => playVideo(video)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play size={18} className="text-white fill-white" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4
                          onClick={() => playVideo(video)}
                          className="font-semibold text-xs text-white truncate group-hover:text-red-500 cursor-pointer"
                        >
                          {video.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 truncate">{video.channelTitle}</p>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] font-mono text-gray-500">{video.publishedAt}</span>
                        <button
                          onClick={() => onAddYoutubeToCollection(video)}
                          className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-[#18181b] transition-colors cursor-pointer"
                          title="Bookmark track"
                        >
                          <Bookmark size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-xs py-10 italic">
              {t.noTracks}
            </div>
          )}
        </div>

        {/* Collection Panel */}
        <div className="space-y-6">
          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                <Heart size={16} className="text-red-500" />
                <span>{t.savedTracks}</span>
              </h3>
              <span className="font-mono text-[10px] bg-[#141419] px-2 py-0.5 rounded text-gray-400">
                {savedYoutubeTracks.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto divide-y divide-[#1c1c24] pr-2">
              {savedYoutubeTracks.length > 0 ? (
                savedYoutubeTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex justify-between items-center py-2.5 first:pt-0 group/li"
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 cursor-pointer"
                      onClick={() => onPlayYoutube(track.audioUrl, track.title, track.artist, track.coverUrl)}
                    >
                      <img src={track.coverUrl} className="w-8 h-8 rounded-md object-cover" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate group-hover/li:text-red-500 transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 truncate">{track.artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveYoutubeFromCollection(track.id)}
                      className="text-gray-500 hover:text-red-500 p-1 rounded-md hover:bg-[#18181b] transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 text-xs py-8 italic">
                  {isRTL ? "مجموعتك فارغة حالياً. اضغط على أيقونة الإشارة المرجعية للحفظ." : "Your collection is empty. Click bookmark icon to save."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
