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
  workerUrl?: string;
}

export default function YoutubeTab(props: YoutubeTabProps) {
  const {
    lang,
    translations,
    onPlayYoutube,
    onAddYoutubeToCollection,
    workerUrl,
  } = props;
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
      let success = false;
      // 1. Attempt local Node.js proxy search
      try {
        const response = await fetch("/api/youtube/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query.trim(), workerUrl: workerUrl?.trim() }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.results) {
            setResults(data.results);
            success = true;
          }
        }
      } catch (localErr) {
        console.warn("Local proxy YouTube search failed, attempting fallback to direct worker query:", localErr);
      }

      // 2. Direct Fallback if local proxy was unavailable/unreachable
      if (!success && workerUrl && workerUrl.trim()) {
        const cleanWorkerUrl = workerUrl.trim().replace(/\/$/, "");
        const res = await fetch(`${cleanWorkerUrl}/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          let parsedResults: YouTubeVideo[] = [];
          
          if (data && data.contents && Array.isArray(data.contents)) {
            for (const item of data.contents) {
              if (item.video) {
                const v = item.video;
                parsedResults.push({
                  id: v.videoId,
                  title: v.title || "Unknown Title",
                  channelTitle: v.author?.name || "Unknown Channel",
                  thumbnailUrl: v.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
                  publishedAt: v.publishedTimeText || "Recent"
                });
              }
            }
          } else if (Array.isArray(data)) {
            parsedResults = data.map((item: any) => ({
              id: item.id || item.videoId,
              title: item.title,
              channelTitle: item.channelTitle || item.author,
              thumbnailUrl: item.thumbnailUrl || item.thumbnail,
              publishedAt: item.publishedAt || ""
            }));
          }
          
          if (parsedResults.length > 0) {
            setResults(parsedResults);
          }
        }
      }
    } catch (err) {
      console.error("YouTube search error:", err);
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
    <div className="space-y-4 pb-12 max-w-4xl mx-auto">
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
  );
}
