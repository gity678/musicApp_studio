import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UploadCloud, Play, Trash2, ArrowUpRight, Check, Sparkles, 
  AlertCircle, RefreshCw, Search, Video, X, ExternalLink, Edit2, Save
} from "lucide-react";
import { Track } from "../types";
import ConfirmMetadataModal from "./ConfirmMetadataModal";

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
  trackToEdit?: Track | null;
  onClearTrackToEdit?: () => void;
  onEditTrack?: (trackId: string, updatedFields: Partial<Track>) => void;
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
  trackToEdit,
  onClearTrackToEdit,
  onEditTrack,
}: UploadTabProps) {
  const isRTL = lang === "ar";
  const t = translations[lang];

  // Active sub-tab inside upload: 'search' (default), 'link', or 'modifier'
  const [activeSubTab, setActiveSubTab] = useState<"link" | "search" | "modifier">("search");

  // Track editor state variables
  const [editTrackId, setEditTrackId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [editAudioUrl, setEditAudioUrl] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editStatus, setEditStatus] = useState<{ msg: string; type: "success" | "error" | "loading" } | null>(null);

  const allEditableSongs = [...customTracks, ...workerTracks];

  // Handle incoming trackToEdit changes from App.tsx/MusicTab.tsx
  useEffect(() => {
    if (trackToEdit) {
      setActiveSubTab("modifier");
      setEditTrackId(trackToEdit.id);
      setEditTitle(trackToEdit.title);
      setEditArtist(trackToEdit.artist);
      setEditCoverUrl(trackToEdit.coverUrl || "");
      setEditAudioUrl(trackToEdit.audioUrl || "");
      setEditDuration(trackToEdit.duration || "");
    }
  }, [trackToEdit]);

  const handleSelectTrackToEditAndFill = (trackId: string) => {
    if (!trackId) {
      setEditTrackId("");
      setEditTitle("");
      setEditArtist("");
      setEditCoverUrl("");
      setEditAudioUrl("");
      setEditDuration("");
      onClearTrackToEdit?.();
      return;
    }
    const track = allEditableSongs.find((tk) => tk.id === trackId);
    if (track) {
      setEditTrackId(track.id);
      setEditTitle(track.title);
      setEditArtist(track.artist);
      setEditCoverUrl(track.coverUrl || "");
      setEditAudioUrl(track.audioUrl || "");
      setEditDuration(track.duration || "");
    }
  };

  const handleSaveTrackEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTrackId) {
      setEditStatus({
        msg: isRTL ? "يرجى اختيار أغنية لتعديلها أولاً" : "Please select a song to edit first",
        type: "error"
      });
      return;
    }
    if (onEditTrack) {
      onEditTrack(editTrackId, {
        title: editTitle,
        artist: editArtist,
        coverUrl: editCoverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
        audioUrl: editAudioUrl,
        duration: editDuration || "3:00"
      });
      setEditStatus({
        msg: isRTL ? "✅ تم حفظ التعديلات بنجاح!" : "✅ Song modified successfully!",
        type: "success"
      });
      setTimeout(() => setEditStatus(null), 3000);
    }
  };

  const clearEditForm = () => {
    setEditTrackId("");
    setEditTitle("");
    setEditArtist("");
    setEditCoverUrl("");
    setEditAudioUrl("");
    setEditDuration("");
    setEditStatus(null);
    onClearTrackToEdit?.();
  };

  // TAB 1: Direct Link Input States
  const [ytUrl, setYtUrl] = useState("");
  const [linkStatus, setLinkStatus] = useState({ loading: false, msg: "", success: false });

  // TAB 2: Search Input States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [songAddStates, setSongAddStates] = useState<Record<string, { loading: boolean; success?: boolean; error?: boolean }>>({});

  // Active preview video ID and details
  const [playVideoId, setPlayVideoId] = useState("");
  const [playVideoTitle, setPlayVideoTitle] = useState("");
  const [playVideoChannel, setPlayVideoChannel] = useState("");
  const [playVideoThumb, setPlayVideoThumb] = useState("");
  const [playVideoDuration, setPlayVideoDuration] = useState("");

  // Track deletion support
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);

  // Metadata Dialog Confirmation parameters
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingVideoId, setPendingVideoId] = useState("");
  const [pendingRawTitle, setPendingRawTitle] = useState("");
  const [pendingYoutubeMeta, setPendingYoutubeMeta] = useState({ title: "", artist: "", thumb: "", source: "YouTube", duration: "" });
  const [pendingItunesMeta, setPendingItunesMeta] = useState<any>(null);

  // Helper formatting timing
  const formatMillis = (ms: number) => {
    if (!ms) return "";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Helper metadata lookups from iTunes API
  const fetchItunesMetadata = async (query: string) => {
    const cleanWorkerUrl = workerUrl.trim().replace(/\/$/, "");
    
    if (cleanWorkerUrl) {
      try {
        const res = await fetch(`${cleanWorkerUrl}/itunes?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.trackTimeMillis && !data.duration) {
            data.duration = formatMillis(data.trackTimeMillis);
          }
          return data; 
        }
      } catch (e) {
        console.warn("iTunes search via worker failed, falling back to public iTunes API", e);
      }
    }

    try {
      const res = await fetch(`https://itunes.apple.com/search?media=music&entity=song&limit=1&term=${encodeURIComponent(query)}`);
      if (res.ok) {
        const raw = await res.json();
        const item = raw?.results?.[0];
        if (item) {
          return {
            title: item.trackName,
            artist: item.artistName,
            thumb: (item.artworkUrl100 || "").replace("100x100bb", "400x400bb"),
            duration: formatMillis(item.trackTimeMillis || 0),
            trackTimeMillis: item.trackTimeMillis
          };
        }
      }
    } catch (e) {
      console.warn("Direct public iTunes search failed", e);
    }
    return null;
  };

  // Upload Workflow Stage 1 (Extract metadata from URL)
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
      setYtUrl("");
      setLinkStatus({
        loading: false,
        msg: isRTL ? "❌ رابط فيديو يوتيوب غير مدعوم أو غير صالح!" : "❌ Invalid YouTube video link format!",
        success: false
      });
      return;
    }

    setLinkStatus({
      loading: true,
      msg: isRTL ? "⏳ جاري استرجاع تفاصيل الفيديو..." : "⏳ Fetching video metadata...",
      success: false
    });

    try {
      // 1. Fetch info from oEmbed
      const ytRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      const ytData = await ytRes.json();
      
      const rawTitle = ytData.title || `YouTube Video ${videoId}`;
      const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      const ytMeta = {
        title: rawTitle,
        artist: ytData.author_name || "YouTube",
        thumb: thumb,
        source: "YouTube",
        duration: ""
      };

      // 2. Fetch from iTunes
      setLinkStatus({
        loading: true,
        msg: isRTL ? "⏳ جاري البحث عن بيانات المسار في iTunes..." : "⏳ Searching iTunes for rich metadata...",
        success: false
      });
      
      const itunesData = await fetchItunesMetadata(rawTitle);

      // 3. Obtain duration if possible
      let finalDuration = itunesData?.duration || "";
      if (!finalDuration && videoId) {
        try {
          const cleanWorkerUrl = workerUrl.trim().replace(/\/$/, "");
          const searchRes = await fetch(`${cleanWorkerUrl}/search?q=${encodeURIComponent(videoId)}`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const foundVideo = searchData?.contents?.find((c: any) => c.video?.videoId === videoId);
            if (foundVideo?.video?.lengthText) {
              finalDuration = foundVideo.video.lengthText;
            } else if (foundVideo?.video?.duration) {
              finalDuration = foundVideo.video.duration;
            }
          }
        } catch (e) {
          console.warn("Worker search fallback for duration failed", e);
        }
      }

      ytMeta.duration = finalDuration;

      // 4. Open Confirm Metadata Dialog
      setPendingVideoId(videoId);
      setPendingRawTitle(rawTitle);
      setPendingYoutubeMeta(ytMeta);
      setPendingItunesMeta(itunesData);
      setIsConfirmOpen(true);
      
      setLinkStatus({ loading: false, msg: "", success: false });
    } catch (err: any) {
      setLinkStatus({
        loading: false,
        msg: isRTL ? "❌ فشل استرجاع البيانات." : `❌ Failed to fetch info: ${err.message}`,
        success: false
      });
    }
  };

  // Upload Workflow Stage 2 (Submit final, confirmed metadata to server)
  const dispatchConfirmedUpload = async (confirmedMeta: { title: string; artist: string; thumb: string; duration: string }) => {
    setIsConfirmOpen(false);
    
    if (activeSubTab === "link") {
      setLinkStatus({ loading: true, msg: isRTL ? "⏳ جاري الإرسال للسيرفر السحابي..." : "⏳ Dispatching to cloud server...", success: false });
    } else {
      setSongAddStates(prev => ({ ...prev, [pendingVideoId]: { loading: true } }));
    }

    const cleanName = confirmedMeta.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
    const cleanWorkerUrl = workerUrl.trim().replace(/\/$/, "");
    const videoUrl = `https://www.youtube.com/watch?v=${pendingVideoId}`;

    let isSuccess = false;
    let errorMsg = "";

    const payload = {
      youtube_url: videoUrl,
      song_name: cleanName,
      title: confirmedMeta.title,
      artist: confirmedMeta.artist,
      thumb: confirmedMeta.thumb,
      duration: confirmedMeta.duration
    };

    try {
      const response = await fetch(cleanWorkerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok || data.success) isSuccess = true;
        else errorMsg = data.body || data.error || "Server error";
      } else {
        errorMsg = `Status ${response.status}`;
      }
    } catch (e: any) {
      // Proxy backup try
      try {
        const response = await fetch("/api/worker/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerUrl, ...payload })
        });
        if (response.ok) isSuccess = true;
        else errorMsg = "Proxy route failed.";
      } catch (e2) {
        errorMsg = "Network error communicating with worker server.";
      }
    }

    if (isSuccess) {
      const successMsg = isRTL 
        ? "✅ تم الإرسال بنجاح! ستبدأ عملية المعالجة قريباً بالتنزيل والتحويل." 
        : "✅ Dispatched successfully! The stream will be processed and downloaded shortly.";
      
      if (activeSubTab === "link") {
        setLinkStatus({ loading: false, msg: successMsg, success: true });
        setYtUrl("");
      } else {
        setSongAddStates(prev => ({ ...prev, [pendingVideoId]: { loading: false, success: true } }));
      }
      setTimeout(() => onReloadWorkerSongs(), 8000);
    } else {
      const failMsg = isRTL ? `❌ فشل الرفع: ${errorMsg}` : `❌ Upload failed: ${errorMsg}`;
      if (activeSubTab === "link") {
        setLinkStatus({ loading: false, msg: failMsg, success: false });
      } else {
        setSongAddStates(prev => ({ ...prev, [pendingVideoId]: { loading: false, error: true } }));
      }
    }
  };

  // Search Submit on Worker Endpoint
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
    setPlayVideoId(""); // Terminate live player instance to secure width

    const cleanWorkerUrl = workerUrl.trim().replace(/\/$/, "");
    try {
      const res = await fetch(`${cleanWorkerUrl}/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.contents && data.contents.length > 0) {
        const videosOnly = data.contents.filter((item: any) => item.type === "video");
        setSearchResults(videosOnly);
      } else {
        setSearchError(isRTL ? "❌ عذراً، لم نعثر على أي نتائج مطابقة." : "❌ No YouTube videos matched your search query.");
      }
    } catch (err: any) {
      console.error("Search on worker endpoint failed:", err);
      setSearchError(isRTL 
        ? "❌ فشل الاتصال بخادم البحث. يرجى تأكيد استقرار اتصال الخادم الخاص بك." 
        : `❌ Failed to communicate with search server: ${err.message}`
      );
    } finally {
      setSearchLoading(false);
    }
  };

  // Trigger search item action
  const handleAddSongFromSearch = async (videoId: string, title: string, channel?: string, thumb?: string, duration?: string) => {
    setSongAddStates(prev => ({ ...prev, [videoId]: { loading: true } }));

    try {
      const ytMeta = {
        title: title,
        artist: channel || "YouTube",
        thumb: thumb || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        source: "YouTube",
        duration: duration || ""
      };

      const itunesData = await fetchItunesMetadata(title);

      setPendingVideoId(videoId);
      setPendingRawTitle(title);
      setPendingYoutubeMeta(ytMeta);
      setPendingItunesMeta(itunesData);
      setIsConfirmOpen(true);
      
      setSongAddStates(prev => ({ ...prev, [videoId]: { loading: false } }));
    } catch (e) {
      setSongAddStates(prev => ({ ...prev, [videoId]: { loading: false, error: true } }));
    }
  };

  const startVideoPreview = (item: any) => {
    // Pause any native HTML5 audio elements on the page to prevent background song overlap
    const audios = document.querySelectorAll("audio");
    audios.forEach((audio) => {
      try {
        audio.pause();
      } catch (e) {
        console.warn(e);
      }
    });

    const v = item.video;
    setPlayVideoId(v.videoId);
    setPlayVideoTitle(v.title);
    setPlayVideoChannel(v.author?.title || "");
    setPlayVideoThumb(v.thumbnails?.[0]?.url || "");
    setPlayVideoDuration(v.lengthText || v.duration || "");
  };

  const closeVideoPreview = () => {
    setPlayVideoId("");
    setPlayVideoTitle("");
    setPlayVideoChannel("");
    setPlayVideoThumb("");
    setPlayVideoDuration("");
  };

  const confirmTrackDeletion = () => {
    if (trackToDelete) {
      onDeleteCustomTrack(trackToDelete.id);
      setTrackToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden space-y-4 pb-12 text-zinc-100">
      
      {/* Subtab Navigation Buttons, styled in beautiful premium dark theme */}
      <div className="w-full max-w-full overflow-hidden shrink-0 mb-4">
        <div className="grid grid-cols-3 bg-[#0c0c0e]/60 border border-[#1e1e24] p-1 rounded-xl gap-1 shadow-sm w-full">
          <button
            onClick={() => {
              setActiveSubTab("search");
              setYtUrl("");
              setLinkStatus({ loading: false, msg: "", success: false });
            }}
            className={`py-2 px-1 sm:px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 overflow-hidden ${
              activeSubTab === "search"
                ? "bg-[#facc15] text-black shadow-md shadow-[#facc15]/10"
                : "bg-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Search size={12} className="shrink-0" />
            <span className="truncate">{isRTL ? "البحث" : "Search"}</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("link");
              setSearchQuery("");
              setSearchResults([]);
              setSearchError("");
              closeVideoPreview();
            }}
            className={`py-2 px-1 sm:px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 overflow-hidden ${
              activeSubTab === "link"
                ? "bg-[#facc15] text-black shadow-md shadow-[#facc15]/10"
                : "bg-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ExternalLink size={12} className="shrink-0" />
            <span className="truncate">{isRTL ? "الرابط المباشر" : "Direct Link"}</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("modifier");
              setSearchQuery("");
              setSearchResults([]);
              setSearchError("");
              closeVideoPreview();
            }}
            className={`py-2 px-1 sm:px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 overflow-hidden ${
              activeSubTab === "modifier"
                ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/10"
                : "bg-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Edit2 size={12} className="shrink-0" />
            <span className="truncate">{isRTL ? "التعديل" : "Modifier"}</span>
          </button>
        </div>
      </div>

      {/* Conditionally render Search Tab Content */}
      {activeSubTab === "search" && (
        <>
          {/* Search Input Section - Premium & spacious like the YouTube Tab */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full">
            <div className="flex-1 relative bg-[#141419] border border-[#1e1e24] rounded-xl focus-within:border-[#facc15] transition-colors">
              <span className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3.5" : "left-3.5"} text-zinc-400`}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder={isRTL ? "ادخل اسم الأغنية أو اسم الفنان..." : "Enter song name, artist..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent py-3 text-xs text-white focus:outline-none ${isRTL ? "pr-10" : "pl-10"}`}
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="bg-[#facc15] text-black hover:bg-yellow-300 hover:scale-105 active:scale-95 disabled:opacity-40 px-6 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {searchLoading ? <RefreshCw size={12} className="animate-spin text-black" /> : null}
              <span>{isRTL ? "ابحث" : "Search"}</span>
            </button>
          </form>

          {searchError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
              {searchError}
            </div>
          )}

          {/* Active Live YouTube Embed style matching YouTube Tab */}
          {playVideoId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3 w-full"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#facc15]/20 bg-black shadow-2xl w-full">
                <iframe
                  id="yt-player"
                  src={`https://www.youtube.com/embed/${playVideoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </div>

              {/* Dedicated control container bar underneath the video */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-900/40 border border-[#1e1e24] p-3 rounded-xl gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] text-zinc-400 font-mono block uppercase tracking-wider mb-0.5">{playVideoChannel || "YouTube Channel"}</span>
                  <h3 className="text-xs font-bold text-white truncate" title={playVideoTitle}>
                    {playVideoTitle}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 justify-end">
                  <button
                    onClick={closeVideoPreview}
                    className="bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title={isRTL ? "إغلاق" : "Close"}
                  >
                    <X size={13} />
                    <span>{isRTL ? "إلغاء" : "Cancel"}</span>
                  </button>

                  <button
                    onClick={() => handleAddSongFromSearch(playVideoId, playVideoTitle, playVideoChannel, playVideoThumb, playVideoDuration)}
                    disabled={songAddStates[playVideoId]?.loading}
                    className="bg-[#facc15] hover:bg-yellow-300 active:scale-95 disabled:opacity-50 text-black px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {songAddStates[playVideoId]?.loading 
                      ? <RefreshCw size={12} className="animate-spin text-black" />
                      : songAddStates[playVideoId]?.success 
                      ? <Check size={12} className="text-black" />
                      : <UploadCloud size={12} className="text-black" />
                    }
                    <span>
                      {songAddStates[playVideoId]?.loading 
                        ? (isRTL ? "جاري الإرسال للتنزيل..." : "Sending...") 
                        : songAddStates[playVideoId]?.success 
                        ? (isRTL ? "تم الإرسال!" : "Dispatched!")
                        : (isRTL ? "بدء التحميل والحفظ" : "Send to Download")}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* List Results section styled exactly like YouTube Tab grid */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto no-scrollbar pt-1 w-full">
              {searchResults.map((item) => {
                const v = item.video;
                const duration = v.lengthText || v.duration || "";
                const isCurrentPreview = playVideoId === v.videoId;
                const itemState = songAddStates[v.videoId] || {};

                return (
                  <div
                    key={v.videoId}
                    className={`bg-[#0c0c0e]/60 border rounded-xl overflow-hidden p-3.5 flex gap-4 hover:bg-[#141419] transition-colors duration-300 group ${
                      isCurrentPreview ? "border-[#facc15]/30 bg-[#facc15]/5" : "border-[#1e1e24]"
                    }`}
                  >
                    {/* Thumbnail Wrapper */}
                    <div className="relative shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-[#1e1e24] bg-zinc-900">
                      <img
                        src={v.thumbnails && v.thumbnails[0] ? v.thumbnails[0].url : "https://images.unsplash.com/photo-161461353535308-eb5fbd3d2c17?w=100&auto=format"}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => startVideoPreview(item)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play size={18} className="text-white fill-white" />
                      </button>
                    </div>

                    {/* Details side */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h4
                          onClick={() => startVideoPreview(item)}
                          className="font-semibold text-xs text-white truncate group-hover:text-[#facc15] cursor-pointer"
                          title={v.title}
                        >
                          {v.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 truncate">{v.author ? v.author.title : "YouTube Video"}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] font-mono text-zinc-500">{duration || "3:30"}</span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startVideoPreview(item)}
                            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-3 py-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                            title={isRTL ? "تشغيل معاينة" : "Preview playback"}
                          >
                            <Play size={10} className="fill-current text-white" />
                            <span>{isRTL ? "تشغيل" : "Play"}</span>
                          </button>

                          <button
                            onClick={() => handleAddSongFromSearch(v.videoId, v.title, v.author?.title, v.thumbnails?.[0]?.url, duration)}
                            disabled={itemState.loading}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                              itemState.success 
                                ? "bg-emerald-500/10 text-emerald-400" 
                                : itemState.error 
                                ? "bg-red-500/10 text-red-400"
                                : "bg-[#facc15] text-black hover:bg-yellow-300"
                            }`}
                          >
                            {itemState.loading ? (
                              <RefreshCw size={8} className="animate-spin text-black" />
                            ) : itemState.success ? (
                              "✅"
                            ) : itemState.error ? (
                              "❌"
                            ) : (
                              (isRTL ? "حفظ" : "Download")
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Conditionally render Direct URL Tab Content */}
      {activeSubTab === "link" && (
        <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-5 shadow-xl space-y-4 w-full overflow-hidden">
          <div className="pb-3 border-b border-zinc-800/60 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#facc15]/20 text-[#facc15] text-[10px] font-mono font-bold shrink-0">
              2
            </span>
            <h2 className="font-sans font-bold text-xs text-zinc-100 truncate">
              {isRTL ? "تحميل المسار عن طريق الرابط المباشر" : "Transfer YouTube Asset by pasting URL"}
            </h2>
          </div>

          <form onSubmit={handleLinkUpload} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-zinc-400 font-extrabold block">
                {isRTL ? "ضع رابط يوتيوب هنا:" : "YouTube Video Url:"}
              </label>
              <input
                type="url"
                required
                placeholder={isRTL ? "مثال: https://www.youtube.com/watch?v=..." : "Paste YouTube link here..."}
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#facc15] transition-colors font-mono min-w-0"
              />
            </div>

            {linkStatus.msg && (
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${
                  linkStatus.success 
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span className="whitespace-pre-line leading-relaxed flex-1">{linkStatus.msg}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={linkStatus.loading}
              className="w-full bg-[#facc15] hover:bg-yellow-300 active:scale-[0.98] disabled:bg-zinc-800/50 disabled:text-zinc-500 disabled:cursor-not-allowed text-black font-black py-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              {linkStatus.loading ? (
                <RefreshCw size={13} className="animate-spin text-black" />
              ) : (
                <ArrowUpRight size={13} className="text-black" />
              )}
              <span>{isRTL ? "تنزيل وإرسال للسيرفر" : "Download & Send to Server"}</span>
            </button>
          </form>

          <div className="pt-2 text-center select-none">
            <a
              href="https://github.com/gity678/Spotify/actions"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors font-semibold"
            >
              <span>{isRTL ? "متابعة تدفق العمل على GitHub ↗" : "Follow workflow on GitHub Actions ↗"}</span>
            </a>
          </div>
        </div>
      )}

      {/* Conditionally render Edit Tab Content */}
      {activeSubTab === "modifier" && (
        <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-5 shadow-xl space-y-4 w-full overflow-hidden">
          <div className="pb-3 border-b border-zinc-800/60 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-400 text-[10px] font-mono font-bold shrink-0">
              3
            </span>
            <h2 className="font-sans font-bold text-xs text-zinc-100 truncate">
              {isRTL ? "تعديل بيانات الأغنية" : "Modify Track Details"}
            </h2>
          </div>

          {!editTrackId ? (
            <div className="py-12 px-4 text-center space-y-3.5">
              <div className="w-12 h-12 bg-yellow-400/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto">
                <Edit2 size={20} />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                {isRTL 
                  ? "يرجى الذهاب إلى صفحة الموسيقى والضغط على 'تعديل الأغنية' من القائمة الجانبية للأغنية المراد تعديلها." 
                  : "Please go to the Music tab and click 'Modify' on any song's option menu to edit its details."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveTrackEdit} className="space-y-4">
              <div className="space-y-3.5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      {isRTL ? "عنوان الأغنية:" : "Song Name:"}
                    </label>
                    <input 
                      type="text" 
                      required
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder={isRTL ? "أدخل عنوان الأغنية..." : "Enter song name..."}
                      className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      {isRTL ? "الفنان:" : "Artist:"}
                    </label>
                    <input 
                      type="text" 
                      required
                      value={editArtist} 
                      onChange={(e) => setEditArtist(e.target.value)}
                      placeholder={isRTL ? "أدخل اسم الفنان..." : "Enter artist name..."}
                      className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    {isRTL ? "رابط الصورة (الغلاف):" : "Cover Photo URL:"}
                  </label>
                  <input 
                    type="text" 
                    value={editCoverUrl} 
                    onChange={(e) => setEditCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com..."
                    className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    {isRTL ? "رابط البث أو ملف الصوت:" : "Audio Stream or URL File:"}
                  </label>
                  <input 
                    type="text" 
                    value={editAudioUrl} 
                    onChange={(e) => setEditAudioUrl(e.target.value)}
                    placeholder={isRTL ? "معرف YouTube أو رابط مباشر..." : "YouTube video ID or direct link..."}
                    className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400 transition-colors font-mono"
                  />
                </div>
              </div>

              {editStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${
                    editStatus.type === "success" 
                      ? "bg-yellow-400/10 border border-yellow-400/20 text-yellow-400" 
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}
                >
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed flex-1">{editStatus.msg}</span>
                </motion.div>
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={clearEditForm}
                  className="flex-1 py-3 bg-[#1e1e24]/60 hover:bg-[#1e1e24] active:scale-95 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  {isRTL ? "إعادة تعيين / إلغاء" : "Clear / Cancel"}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-black rounded-xl text-xs font-black transition-all cursor-pointer text-center shadow-md shadow-yellow-400/10 flex items-center justify-center gap-1.5"
                >
                  <Save size={13} className="text-black" />
                  <span>{isRTL ? "حفظ التغييرات" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Track deletion confirm dialog box */}
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
                <Trash2 size={20} className="animate-pulse" />
              </div>

              <div className="space-y-1.5 text-center">
                <h3 className="text-zinc-900 font-extrabold text-sm">
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
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  {isRTL ? "نعم، احذف" : "Yes, Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setTrackToDelete(null)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-zinc-200 active:scale-95"
                >
                  {isRTL ? "إلغاء العمل" : "Cancel"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmMetadataModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={dispatchConfirmedUpload}
        videoId={pendingVideoId}
        rawTitle={pendingRawTitle}
        youtubeMeta={pendingYoutubeMeta}
        itunesMeta={pendingItunesMeta}
        lang={lang}
      />

    </div>
  );
}
