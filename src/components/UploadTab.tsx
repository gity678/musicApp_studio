import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UploadCloud, Play, Trash2, ArrowUpRight, Check, Sparkles, 
  AlertCircle, RefreshCw, Search, Video, X, ExternalLink
} from "lucide-react";
import { Track } from "../types";

interface UploadTabProps {
  customTracks: Track[];
  onAddCustomTrack: (title: string, artist: string, url: string, genre: string, cover?: string) => void;
  onDeleteCustomTrack: (trackId: string) => void;
  onSelectTrack: (track: Track) => void;
  currentTrack: Track | null;
  lang: "en" | "ar";
  translations: any;
  workerUrl: string;
  setWorkerUrl: (val: string) => void;
  workerTracks: Track[];
  isWorkerLoading: boolean;
  onReloadWorkerSongs: () => void;
  workerError?: string;
}

export default function UploadTab({
  customTracks,
  onAddCustomTrack,
  onDeleteCustomTrack,
  onSelectTrack,
  currentTrack,
  lang,
  translations,
  workerUrl,
  setWorkerUrl,
  workerTracks,
  isWorkerLoading,
  onReloadWorkerSongs,
  workerError,
}: UploadTabProps) {
  const isRTL = lang === "ar";
  const t = translations[lang];

  // Active Tab state inside upload page: 'link' (Upload by Link) or 'search' (Upload by Search)
  const [activeSubTab, setActiveSubTab] = useState<"link" | "search">("link");

  // TAB 1: Link Upload States
  const [ytUrl, setYtUrl] = useState("");
  const [linkStatus, setLinkStatus] = useState({ loading: false, msg: "", success: false });

  // TAB 2: Search Upload States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [songAddStates, setSongAddStates] = useState<Record<string, { loading: boolean; success?: boolean; error?: boolean }>>({});

  // Active video player preview URL
  const [playVideoId, setPlayVideoId] = useState("");
  const [playVideoTitle, setPlayVideoTitle] = useState("");

  // Beautiful interactive deletion confirm modal
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);

  // 1) Action: Send YouTube Link
  const handleLinkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerUrl.trim()) {
      setLinkStatus({
        loading: false,
        msg: isRTL ? "يرجى تهيئة الخادم السحابي أولاً." : "Cloud server setup is not configured.",
        success: false
      });
      return;
    }
    if (!ytUrl.trim()) return;

    const videoId = ytUrl.match(/(?:v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/watch\?v=)([^&?/]+)/)?.[1];
    if (!videoId) {
      setLinkStatus({
        loading: false,
        msg: isRTL ? "❌ رابط فيديو يوتيوب غير مدعوم أو غير صالح!" : "❌ Invalid YouTube video link format!",
        success: false
      });
      return;
    }

    setLinkStatus({
      loading: true,
      msg: isRTL ? "⏳ جاري استرجاع تفاصيل التراك والرفع التلقائي..." : "⏳ Fetching video details & deploying...",
      success: false
    });

    let cleanName = `Youtube_${videoId}`;
    try {
      // noembed is highly reliable and CORS-safe
      const oembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      const oembedData = await oembedRes.json();
      if (oembedData && oembedData.title) {
        cleanName = oembedData.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
      }
    } catch (e) {
      console.warn("Title fetch failed, fallback to videoId code", e);
    }

    const cleanWorkerUrl = workerUrl.trim().replace(/\/$/, "");
    let isSuccess = false;
    let errorMsg = "";

    // Dispatch upload to Cloudflare worker (directly or via express proxy)
    try {
      const response = await fetch(cleanWorkerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: ytUrl.trim(), song_name: cleanName })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok || data.success) {
          isSuccess = true;
        } else {
          errorMsg = data.body || data.error || "Worker refused dispatch request.";
        }
      } else {
        errorMsg = `Server response code: ${response.status}`;
      }
    } catch (directErr: any) {
      console.warn("Direct dispatcher query failed, falling back to backend server proxy: ", directErr);
      try {
        const response = await fetch("/api/worker/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workerUrl: workerUrl.trim(),
            youtube_url: ytUrl.trim(),
            song_name: cleanName
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.ok || data.success || !data.error) {
            isSuccess = true;
          } else {
            errorMsg = data.error;
          }
        }
      } catch (proxyErr: any) {
        errorMsg = proxyErr.message || "Failed to reach Cloudflare worker API.";
      }
    }

    if (isSuccess) {
      setLinkStatus({
        loading: false,
        msg: isRTL 
          ? "✅ تم الرفع وبدء المعالجة بنجاح! سيتم تنزيل الأغنية وتحميلها سحابياً في بضع ثوانٍ." 
          : "✅ Dispatched successfully! The automated downloader is transferring your audio now.",
        success: true
      });
      setYtUrl("");
      // Sync track list automatically in 10s
      setTimeout(() => {
        onReloadWorkerSongs();
      }, 10000);
    } else {
      setLinkStatus({
        loading: false,
        msg: errorMsg || (isRTL ? "فشل إرسال التراك للـ Worker الخاص بك." : "Dispatched upload request rejected."),
        success: false
      });
    }
  };

  // 2) Action: Do YouTube Search
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    if (!workerUrl.trim()) {
      setSearchError(isRTL ? "خادم الرفع غير مهيأ." : "Cloud engine is not configured.");
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    setSearchResults([]);
    setPlayVideoId(""); // close player

    const cleanWorkerUrl = workerUrl.trim().replace(/\/$/, "");
    try {
      const res = await fetch(`${cleanWorkerUrl}/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.contents && data.contents.length > 0) {
        const videosOnly = data.contents.filter((item: any) => item.type === "video");
        setSearchResults(videosOnly);
      } else {
        setSearchError(isRTL ? "❌ عذراً، لم نعثر على أي نتائج مطابقة للبحث." : "❌ No YouTube videos matched your search.");
      }
    } catch (err: any) {
      console.error("Search on worker endpoint failed:", err);
      setSearchError(isRTL 
        ? "❌ فشل الاتصال بالـ Worker للبحث. يرجى مراجعة إعدادات التشغيل وتأكيد اتصال خادمك." 
        : `❌ Failed to communicate with search server: ${err.message}`
      );
    } finally {
      setSearchLoading(false);
    }
  };

  // 3) Action: Dispatch video found in search list
  const handleAddSongFromSearch = async (videoId: string, title: string) => {
    setSongAddStates(prev => ({ ...prev, [videoId]: { loading: true } }));

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const cleanName = title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");

    const cleanWorkerUrl = workerUrl.trim().replace(/\/$/, "");
    let isSuccess = false;

    // Direct fetch to worker
    try {
      const response = await fetch(cleanWorkerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: url, song_name: cleanName })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.ok || data.success) {
          isSuccess = true;
        }
      }
    } catch (directErr) {
      console.warn("Direct song add failed, attempting Proxy fallback...", directErr);
      try {
        const response = await fetch("/api/worker/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workerUrl: workerUrl.trim(),
            youtube_url: url,
            song_name: cleanName
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.ok || data.success || !data.error) {
            isSuccess = true;
          }
        }
      } catch {
        isSuccess = false;
      }
    }

    if (isSuccess) {
      setSongAddStates(prev => ({ ...prev, [videoId]: { loading: false, success: true } }));
      setTimeout(() => {
        onReloadWorkerSongs();
      }, 10000);
    } else {
      setSongAddStates(prev => ({ ...prev, [videoId]: { loading: false, error: true } }));
    }
  };

  const startVideoPreview = (id: string, title: string) => {
    setPlayVideoId(id);
    setPlayVideoTitle(title);
  };

  const closeVideoPreview = () => {
    setPlayVideoId("");
    setPlayVideoTitle("");
  };

  const confirmTrackDeletion = () => {
    if (trackToDelete) {
      onDeleteCustomTrack(trackToDelete.id);
      setTrackToDelete(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10 text-zinc-800 max-w-2xl mx-auto">
      {/* Main Container - Centered Single Column with Light Theme styling */}
      <div className="space-y-6">
        
        {/* Quick Tab switcher Buttons - Light Border Styled */}
        <div className="flex bg-white border border-zinc-200 p-1.5 rounded-xl gap-2 shadow-sm">
          <button
            onClick={() => setActiveSubTab("link")}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeSubTab === "link"
                ? "bg-[#1db954] text-white shadow-md shadow-[#1db954]/10"
                : "bg-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <ExternalLink size={14} />
            <span>{isRTL ? "الرفع عن طريق وضع الرابط" : "Upload by Link"}</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("search")}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeSubTab === "search"
                ? "bg-[#1db954] text-white shadow-md shadow-[#1db954]/10"
                : "bg-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Search size={14} />
            <span>{isRTL ? "الرفع عن طريق البحث" : "Upload by Search"}</span>
          </button>
        </div>

        {/* Interactive Section */}
        <div className="bg-white border border-zinc-200 p-5 md:p-6 rounded-2xl shadow-sm space-y-4">
          
          {/* PART 1: Upload by YouTube Link */}
          {activeSubTab === "link" && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-zinc-200 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1db954]/10 text-[#1db954] text-[10px] font-mono font-bold">1</span>
                <h2 className="font-sans font-bold text-xs md:text-sm text-zinc-800">
                  {isRTL ? "تحميل تراك يوتيوب عن طريق الرابط المباشر" : "Transfer YouTube Asset by pasting URL"}
                </h2>
              </div>

              <form onSubmit={handleLinkUpload} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                    {isRTL ? "ضع رابط فيديو اليوتيوب في هذه الخانة:" : "YouTube Video Url:"}
                  </label>
                  <input
                    type="url"
                    required
                    placeholder={isRTL ? "ضع الرابط هنا... (مثال: https://www.youtube.com/watch?v=...)" : "Paste YouTube link here..."}
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:border-[#1db954] transition-colors font-mono"
                  />
                </div>

                {linkStatus.msg && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                      linkStatus.success 
                        ? "bg-[#1db954]/10 border border-[#1db954]/20 text-[#1db954]" 
                        : "bg-red-500/10 border border-red-500/20 text-red-500"
                    }`}
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line leading-relaxed">{linkStatus.msg}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={linkStatus.loading}
                  className="w-full bg-[#1db954] text-white hover:bg-[#20cf5d] active:scale-[0.98] disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed font-black py-3 rounded-xl text-xs transition-with-duration cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  {linkStatus.loading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <ArrowUpRight size={14} />
                  )}
                  <span>{isRTL ? "تنزيل وإرسال للسيرفر" : "Download & Send to Server"}</span>
                </button>
              </form>

              <div className="pt-2 text-center">
                <a
                  href="https://github.com/gity678/Spotify/actions"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-zinc-800 transition-colors"
                >
                  <span>{isRTL ? "متابعة تدفق العمل على GitHub ↗" : "Follow workflow on GitHub Actions ↗"}</span>
                </a>
              </div>
            </div>
          )}

          {/* PART 2: Upload by Searching YouTube */}
          {activeSubTab === "search" && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-zinc-200 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1db954]/10 text-[#1db954] text-[10px] font-mono font-bold">2</span>
                <h2 className="font-sans font-bold text-xs md:text-sm text-zinc-800">
                  {isRTL ? "البحث عن فيديو يوتيوب وتحميله" : "Interactive Music Search & Host Finder"}
                </h2>
              </div>

              {/* Search Bar Input */}
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-3 text-zinc-400`} size={14} />
                  <input
                    type="text"
                    placeholder={isRTL ? "ادخل اسم الأغنية أو اسم الفنان..." : "Enter song name, artist..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full bg-zinc-50 border border-zinc-200 ${isRTL ? "pr-9 pl-4" : "pl-9 pr-4"} py-2.5 rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-[#1db954] transition-colors`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="bg-[#1db954] text-white hover:bg-[#20cf5d] active:scale-95 disabled:opacity-50 px-5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {searchLoading ? <RefreshCw size={12} className="animate-spin" /> : null}
                  <span>{isRTL ? "ابحث" : "Search"}</span>
                </button>
              </form>

              {searchError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs">
                  {searchError}
                </div>
              )}

              {/* Embedded YouTube preview player block */}
              {playVideoId && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-sans">
                      <Video size={12} className="text-[#1db954]" />
                      <span>{isRTL ? "معاينة الفيديو النشطة:" : "Active Video Preview:"} <strong className="text-zinc-800 font-semibold">{playVideoTitle}</strong></span>
                    </span>
                    <button
                      onClick={closeVideoPreview}
                      className="text-zinc-400 hover:text-zinc-800 p-1 rounded-md hover:bg-zinc-100 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-zinc-200 bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${playVideoId}?autoplay=1`}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className="w-full h-full border-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddSongFromSearch(playVideoId, playVideoTitle)}
                      disabled={songAddStates[playVideoId]?.loading}
                      className="flex-1 bg-[#1db954] text-white hover:bg-[#20cf5d] disabled:opacity-50 py-2 rounded-lg text-xs font-black cursor-pointer transition-all"
                    >
                      {songAddStates[playVideoId]?.loading 
                        ? (isRTL ? "⏳ جاري إرسال الطلب..." : "⏳ Transmitting request...") 
                        : songAddStates[playVideoId]?.success 
                        ? (isRTL ? "✅ تم إضافة الأغنية للتحميل!" : "✅ Song Dispatched!")
                        : songAddStates[playVideoId]?.error 
                        ? (isRTL ? "❌ فشل الرفع" : "❌ Process Failed")
                        : (isRTL ? "تنزيل وإضافة التراك لمعرض السحابة" : "Download & Save Track")}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Search Results list rendered beautifully */}
              {searchResults.length > 0 && (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto no-scrollbar pr-1 pt-2">
                  {searchResults.map((item) => {
                    const v = item.video;
                    const isCurrentPreview = playVideoId === v.videoId;
                    const itemState = songAddStates[v.videoId] || {};

                    return (
                      <div
                        key={v.videoId}
                        className={`p-2.5 bg-zinc-50 rounded-xl border hover:border-zinc-300 flex items-center gap-3 transition-colors ${
                          isCurrentPreview ? "border-[#1db954]/40 bg-zinc-100/60" : "border-zinc-200"
                        }`}
                      >
                        <img
                          src={v.thumbnails && v.thumbnails[0] ? v.thumbnails[0].url : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&auto=format"}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover bg-zinc-200 shrink-0 select-none cursor-pointer hover:brightness-75 transition"
                          onClick={() => startVideoPreview(v.videoId, v.title)}
                        />

                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() => startVideoPreview(v.videoId, v.title)}
                            className="text-[11px] font-bold text-zinc-900 truncate cursor-pointer hover:text-[#1db954] transition-colors"
                            title={v.title}
                          >
                            {v.title}
                          </h4>
                          <p className="text-[9px] text-zinc-400 truncate mt-0.5">
                            {v.author ? v.author.title : "YouTube Channel"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startVideoPreview(v.videoId, v.title)}
                            className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                            title={isRTL ? "تشغيل معاينة" : "Preview playback"}
                          >
                            <Play size={10} className="fill-current" />
                          </button>

                          <button
                            onClick={() => handleAddSongFromSearch(v.videoId, v.title)}
                            disabled={itemState.loading}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight transition-all cursor-pointer ${
                              itemState.success 
                                ? "bg-[#1db954]/20 text-[#1db954]" 
                                : itemState.error 
                                ? "bg-red-500/20 text-red-500"
                                : "bg-[#1db954] text-white hover:bg-[#20cf5d]"
                            }`}
                          >
                            {itemState.loading ? (
                              <RefreshCw size={8} className="animate-spin" />
                            ) : itemState.success ? (
                              "✅"
                            ) : itemState.error ? (
                              "❌"
                            ) : (
                              "➕"
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* --- CONFIRM DELETION MODAL DIALOG ("هل تريد الحذف") --- */}
      <AnimatePresence>
        {trackToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-zinc-200 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-xl relative"
            >
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={22} className="animate-pulse" />
              </div>

              <div className="space-y-1.5 text-center">
                <h3 className="text-zinc-900 font-black text-sm">
                  {isRTL ? "تأكيد حذف الأغنية" : "Confirm Song Deletion"}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
                  {isRTL 
                    ? `هل أنت متأكد من رغبتك في حذف الأغنية "${trackToDelete.title}"؟` 
                    : `Are you sure you want to delete "${trackToDelete.title}"?`}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={confirmTrackDeletion}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  {isRTL ? "نعم، احذف" : "Yes, Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setTrackToDelete(null)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-zinc-200 active:scale-95"
                >
                  {isRTL ? "إلغاء الحفظ" : "Cancel"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
